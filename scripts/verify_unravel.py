"""Exercise local API/browser integration using disposable data and real Chromium."""
import json, os, shutil, subprocess, sys, tempfile, time, urllib.request, urllib.error
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
BASE='http://127.0.0.1:8023'
def request(path,payload=None,method=None):
    req=urllib.request.Request(BASE+path,data=json.dumps(payload).encode() if payload is not None else None,method=method,headers={'Content-Type':'application/json','X-Ravel-Client':'workshop'})
    with urllib.request.urlopen(req,timeout=10) as response:
        return json.loads(response.read()) if 'application/json' in response.headers.get('Content-Type','') else response.read().decode()
def wait_job(identifier):
    for _ in range(800):
        result=request('/api/jobs/'+identifier)
        if result['status'] in {'completed','failed','cancelled','interrupted'}:return result
        time.sleep(.2)
    raise AssertionError('Job did not finish: '+str(result))
HARNESS="""
import os,sys,threading,uvicorn

original=uvicorn.Server.run
def run(server,*args,**kwargs):
    def stop():
        os.read(sys.stdin.fileno(),1);server.should_exit=True
    threading.Thread(target=stop,daemon=True).start()
    return original(server,*args,**kwargs)
uvicorn.Server.run=run
from apps.ravel.cli import main
main()
"""
def main():
    records=[]
    with tempfile.TemporaryDirectory(prefix='unravel-verification-') as temporary:
        home=Path(temporary)/'data';source=Path(temporary)/'source';shutil.copytree(ROOT/'examples/profile-photo',source);logpath=ROOT/'.local/unravel-browser.log';logpath.parent.mkdir(exist_ok=True)
        def start(log):
            server=subprocess.Popen([sys.executable,'-c',HARNESS,'serve','--home',str(home),'--port','8023'],cwd=ROOT,stdin=subprocess.PIPE,stdout=log,stderr=subprocess.STDOUT,creationflags=subprocess.CREATE_NO_WINDOW if os.name=='nt' else 0)
            for _ in range(100):
                if server.poll() is not None:raise AssertionError(logpath.read_text())
                try:request('/healthz');return server
                except OSError:time.sleep(.1)
            raise AssertionError('Server unreachable')
        def stop(server):
            server.stdin.write(b'x');server.stdin.flush();server.wait(timeout=20)
        with logpath.open('w') as log:
            server=start(log)
            try:
                p=request('/api/projects',{'root':str(source)});assert wait_job(p['job_id'])['status']=='completed'
                features=request(f"/api/projects/{p['id']}/features");feature=next(f for f in features if f['title']=='Upload photo')
                graph=request(f"/api/features/{feature['id']}/map");assert graph['nodes'] and any(e['kind']=='inferred' for e in graph['edges'])
                inv=request('/api/investigations',{'feature_id':feature['id']});note=request(f"/api/investigations/{inv['id']}/discoveries",{'title':'Upload path','body':'The request checks response.ok.'})
                request(f"/api/projects/{p['id']}/trust",{'trusted':True},'PATCH')
                def run(scenario,steps,target='/api/photo',url='http://127.0.0.1:8017',cancel=False):
                    recipe=request(f"/api/projects/{p['id']}/recipes",{'feature_id':feature['id'],'label':scenario+' upload test','url':url,'scenario':scenario,'request_path':target,'steps':steps})
                    result=request(f"/api/recipes/{recipe['id']}/runs",{'approved':True,'disposable_data':True})
                    if cancel:time.sleep(.3);request(f"/api/jobs/{result['job_id']}/cancel",{},'POST')
                    wait_job(result['job_id'])
                    for _ in range(100):
                        result=request('/api/experiment-runs/'+result['id'])
                        if result['status'] not in {'running','queued'}:break
                        time.sleep(.1)
                    records.append(result);return result
                upload=[{'action':'upload','name':'Choose photo'},{'action':'click','name':'Upload photo'}]
                fail=run('failure',[*upload,{'action':'assert','name':'Upload failed. Try again.'}]);assert fail['status']=='expectation_met',fail
                assert any(r['path']=='/api/photo' and r['status']==503 for r in fail['requests'])
                slow=run('slow',[*upload,{'action':'assert','name':'Uploading photo…'},{'action':'wait','milliseconds':2500},{'action':'assert','name':'Photo uploaded'}]);assert slow['status']=='expectation_met',slow
                wrong=run('failure',[*upload,{'action':'assert','name':'Photo uploaded'}]);assert wrong['status']=='expectation_not_met',wrong
                unmatched=run('failure',[*upload,{'action':'assert','name':'Photo uploaded'}],target='/not-a-real-request');assert unmatched['status']=='inconclusive',unmatched
                missing=run('failure',[{'action':'click','name':'Missing upload control'}]);assert missing['status']=='execution_error',missing
                unreachable=run('failure',[{'action':'wait'}],url='http://127.0.0.1:59991');assert unreachable['status']=='execution_error',unreachable
                cancelled=run('slow',[{'action':'wait','milliseconds':10000}],cancel=True);assert cancelled['status']=='cancelled',cancelled
                reload=run('reload',[*upload,{'action':'assert','name':'Photo uploaded'},{'action':'reload'},{'action':'assert','name':'Choose a photo to begin.'}]);assert reload['status']=='expectation_met',reload
                assert fail['artifact_ids'];image=urllib.request.urlopen(BASE+'/api/artifacts/'+fail['artifact_ids'][0]).read();assert image.startswith(b'\x89PNG')
                request(f"/api/experiment-runs/{fail['id']}/artifacts",method='DELETE')
                try:request('/api/artifacts/'+fail['artifact_ids'][0]);raise AssertionError('Deleted image still available')
                except urllib.error.HTTPError as error:assert error.code==404
            finally:stop(server)
            server=start(log)
            try:
                assert request(f"/api/investigations/{inv['id']}/discoveries")[0]['id']==note['id']
                assert len(request(f"/api/projects/{p['id']}/experiment-runs"))==8
                assert 'expectation_not_met' in request(f"/api/projects/{p['id']}/walkthrough")
            finally:stop(server)
    output=ROOT/'.local/unravel-browser-results.json';output.write_text(json.dumps({'runs':records,'restart':'passed','artifact_deletion':'passed','source_map':'passed'},indent=2),encoding='utf-8')
    print('PASS: real source map, 8 controlled browser outcomes, screenshots, deletion, notes, export and restart.')
if __name__=='__main__':main()





