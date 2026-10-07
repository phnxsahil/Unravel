"""Source-reviewed offline retrieval evaluation; no live model quality claims."""
import json,time
from pathlib import Path
from apps.ravel.source import capture,parse
from apps.ravel.ai import SourceRequest,retrieve,validate_evidence
ROOT=Path(__file__).resolve().parents[1]
# Each marker and expected statement were reviewed against these checked-in sources.
CASES={
'profile-photo':[
('web/ProfilePhoto.tsx','if (!file) return','No upload occurs without a selected file.'),
('web/ProfilePhoto.tsx','setStatus("Uploading','The upload handler enters a waiting state.'),
('web/ProfilePhoto.tsx','await uploadPhoto','Success waits for the upload promise.'),
('web/ProfilePhoto.tsx','Upload failed.','The catch branch exposes an error message.'),
('web/ProfilePhoto.tsx','disabled={!file}','The upload button is disabled before file selection.'),
('web/api.ts','fetch(','The literal upload destination is /api/photo.'),
('web/api.ts','response.ok','The request rejects non-success responses.'),
('api/routes.py','len(body) > 512000','The API bounds upload size.'),
('api/routes.py','startswith','The API checks the PNG header.'),
('api/routes.py','photos.append','The source appends to an in-memory collection, not durable storage.')],
'request-flow':[
('App.tsx','useState','The editor uses React state.'),
('App.tsx','textarea','The visible control is a textarea, not an upload.'),
('App.tsx','onChange','Input changes update body state.'),
('App.tsx','value={body}','The textarea reads controlled state.'),
('routes.py','from store import','The route imports a storage helper; this alone is not execution.'),
('routes.py','router =','The API uses APIRouter.'),
('routes.py','@router.post','A POST route is declared for /drafts.'),
('routes.py','body: str','The handler declares a string input.'),
('routes.py','return save_draft','The handler delegates to save_draft.'),
('store.py','return {','The helper returns a dictionary; persistence is not established.')],
'search-flow':[
('Search.tsx','encodeURIComponent','The query is escaped before constructing a request.'),
('Search.tsx','response.ok','The client checks response status.'),
('Search.tsx','Array.isArray','The client verifies the results array shape.'),
('Search.tsx','setResults(data.results)','The client copies returned results into state.'),
('Search.tsx','Search unavailable','Failures produce a visible fallback message.'),
('api.py',"@app.get",'A literal GET search route exists.'),
('api.py',"variant == 'broken'",'A deliberately broken variant is explicit.'),
('api.py','HTTPException(500','The broken variant raises a server error.'),
('api.py',"'items':",'The ambiguous variant returns items, which differs from the client results contract.'),
('api.py','q.lower()','The correct branch applies a case-insensitive filter.')]
}
def main():
 records=[];baseline=0;enhanced=0
 for project,cases in CASES.items():
  snapshot=capture(ROOT/'examples'/project);snapshot['analysis']=parse(snapshot['files']);snapshot['id']=project+'-reviewed'
  entry=next(f for f in snapshot['files'] if f['path'].endswith('.tsx'))
  for index,(path,marker,fact) in enumerate(cases,1):
   original=next(f for f in snapshot['files'] if f['path']==path)
   line=next(i for i,text in enumerate(original['body'].splitlines(),1) if marker in text)
   initial=path==entry['path'] and line<=45;baseline+=initial
   started=time.perf_counter();context=retrieve(snapshot,SourceRequest(kind='search',query=marker));duration=(time.perf_counter()-started)*1000
   covered=any(e['path']==path and e['start_line']<=line<=e['end_line'] for e in context);enhanced+=covered
   answer={'summary':fact,'claims':[{'text':fact,'kind':'source','citations':[{'path':path,'line':line,'end_line':line}]}],'questions':['What would a controlled run establish?'],'experiment':'Inspect source before choosing a bounded scenario.'}
   validate_evidence(answer,context)
   records.append({'id':f'{project}-{index:02}','project':project,'question':fact,'expected':{'path':path,'line':line,'marker':marker},'source_review':'Agent reviewed against checked-in source; no independent human review','baseline_context_covered':initial,'retrieved_context_covered':covered,'retrieval_ms':round(duration,3),'live_model':False})
 assert len(records)==30 and enhanced==30
 # Range validation explicitly cannot reject a false meaning with a valid location.
 semantic={'summary':'Unsupported permanence','claims':[{'text':'The photo survives forever','kind':'source','citations':[{'path':'a.py','line':1,'end_line':1}]}],'questions':['Is it durable?'],'experiment':'Restart and observe.'}
 validate_evidence(semantic,[{'path':'a.py','start_line':1,'end_line':1,'body':'photos.append(body)'}])
 report={'cases':records,'total':30,'projects':3,'baseline':'Single entry-file first 45 lines; source-context coverage, not model explanation quality','baseline_context_coverage':baseline,'retrieval_context_coverage':enhanced,'semantic_validation_limit_demonstrated':True,'supported_live_claims':None,'live_false_alarms':None,'live_useful_experiments':None,'live_latency_ms':None,'actual_live_tokens':None,'actual_live_cost':None,'live_provider_evaluation':'Unavailable: no authorized configured provider key. No paid model calls or invented model metrics.'}
 target=ROOT/'.local/evaluation/unravel';target.mkdir(parents=True,exist_ok=True);(target/'results.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
 print(f'PASS: 30 source-reviewed cases / 3 projects; context coverage baseline {baseline}/30, retrieval {enhanced}/30. Live AI evaluation unavailable; semantic correctness not proven.')
if __name__=='__main__':main()
