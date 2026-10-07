import asyncio
import pytest
from pydantic import ValidationError
from fastapi.testclient import TestClient
from apps.ravel.experiments import RecipeInput, Step, origin
from apps.ravel.maps import feature_map
from apps.ravel.source import capture, make_features, parse
from apps.ravel.api import create_app
from apps.ravel.storage import Storage
from apps.ravel.ai import SourceRequest, retrieve
HEADERS = {'X-Ravel-Client':'workshop'}

@pytest.mark.parametrize('url',['https://example.com','http://127.0.0.1.evil.test:8000','file:///tmp/a','http://user:password@localhost:8017','http://0.0.0.0:8000'])
def test_reject_remote_and_credential_origins(url):
    with pytest.raises(ValueError): origin(url)

@pytest.mark.parametrize('action,value',[('navigate','//example.com'),('navigate','/\\example.com'),('navigate','/a?token=secret'),('javascript','alert(1)'),('shell','echo bad')])
def test_steps_cannot_execute_code_or_escape_origin(action,value):
    with pytest.raises(ValidationError): Step(action=action,value=value)

def test_recipe_caps_and_secret_inputs():
    with pytest.raises(ValidationError): Step(action='fill',name='Password',value='private')
    with pytest.raises(ValidationError): RecipeInput(feature_id='a',label='example',url='http://localhost:1',steps=[{'action':'wait'}]*21)
    with pytest.raises(ValidationError): RecipeInput(feature_id='a',label='example',url='http://localhost:1?token=secret',steps=[{'action':'wait'}])

def test_map_requires_evidence_and_never_claims_runtime(tmp_path):
    (tmp_path/'App.tsx').write_text('import {upload} from "./api";\nexport function App(){return <button>Upload photo</button>}')
    (tmp_path/'api.ts').write_text('export const upload=()=>fetch("/api/photo");')
    (tmp_path/'routes.py').write_text('from fastapi import FastAPI\napp=FastAPI()\n@app.post("/api/photo")\ndef photo(): return {}')
    snapshot=capture(tmp_path);snapshot['analysis']=parse(snapshot['files']);snapshot['id']='snapshot-1'
    feature=next(f for f in make_features(snapshot) if 'App.tsx' in f['paths']);feature['id']='feature-1'
    result=feature_map(snapshot,feature)
    assert result['title']=='Upload photo'
    assert result['nodes'] and result['edges']
    assert all(n['citations'] for n in result['nodes'])
    assert all(e['citations'] and e['kind'] in {'source','inferred'} for e in result['edges'])
    assert any(e['kind']=='inferred' for e in result['edges'])
    assert not any(e['kind']=='observed' for e in result['edges'])
    with pytest.raises(ValueError): retrieve(snapshot,SourceRequest(kind='symbol',path='../secret',query='photo'))

def test_artifact_api_opaque_paths_and_recipe_approval(tmp_path):
    home=tmp_path/'storage'; app=create_app(home)
    with TestClient(app) as client:
        db=app.state.db
        project=db.create('projects',{'name':'sample','root':str(tmp_path),'trusted':False,'status':'ready','latest_snapshot_id':None,'file_count':1,'feature_count':1})
        feature=db.create('features',{'title':'Upload','paths':['App.tsx']},project_id=project['id'],snapshot_id='source')
        payload={'feature_id':feature['id'],'label':'Photo failure','url':'http://127.0.0.1:8017','request_path':'/api/photo','steps':[{'action':'assert','name':'Upload failed. Try again.'}]}
        response=client.post(f"/api/projects/{project['id']}/recipes",json=payload,headers=HEADERS)
        assert response.status_code==201
        recipe=response.json()
        assert client.post(f"/api/recipes/{recipe['id']}/runs",json={'approved':True,'disposable_data':True},headers=HEADERS).status_code==400
        assert client.get('/api/artifacts/unknown-id').status_code==404
        run=db.create('experiment_runs',{'status':'expectation_met','artifact_ids':[],'label':'test','message':'test'},project_id=project['id'])
        outside=tmp_path/'outside.png';outside.write_bytes(b'private')
        artifact=db.create('artifacts',{'filename':'../../outside.png'},parent_id=run['id'],project_id=project['id'])
        assert client.get(f"/api/artifacts/{artifact['id']}").status_code==404
        assert client.delete(f"/api/experiment-runs/{run['id']}/artifacts",headers=HEADERS).status_code==204
        assert outside.read_bytes()==b'private'
        assert client.get(f"/api/projects/{project['id']}/walkthrough").status_code==200


@pytest.mark.asyncio
async def test_interrupted_experiment_preserves_evidence_without_reexecution(tmp_path):
    from apps.ravel.service import Workshop
    db=Storage(tmp_path/'restart.sqlite');workshop=Workshop(db)
    project=db.create('projects',{'name':'sample','root':str(tmp_path),'trusted':True})
    recipe=db.create('recipes',{'label':'sample'},project_id=project['id'])
    run=db.create('experiment_runs',{'status':'running','events':[{'message':'Action started'}],'requests':[{'path':'/api/photo','status':503}]},project_id=project['id'])
    job=workshop.enqueue('experiment',project['id'],{'run_id':run['id'],'recipe_id':recipe['id']});db.patch('jobs',job['id'],{'status':'running'})
    task=asyncio.create_task(workshop.worker());await asyncio.sleep(.05);workshop.stopping=True;await task
    result=db.get('experiment_runs',run['id']);assert result['status']=='execution_error';assert result['requests'][0]['status']==503;assert result['events'][0]['message']=='Action started';assert db.get('jobs',job['id'])['status']=='interrupted'
    db.engine.dispose()

def test_reference_correct_broken_and_ambiguous_contracts():
    from apps.ravel.reference import create_reference
    from apps.ravel.experiments import PHOTO
    for variant,status in [('correct',200),('broken',500),('ambiguous',200)]:
        with TestClient(create_reference(variant)) as client:
            response=client.post('/api/photo',content=PHOTO)
            assert response.status_code==status
            if variant=='correct':assert response.json()=={'uploaded':True,'count':1}
            if variant=='ambiguous':assert response.json()=={'accepted':True,'stored':False}


def test_search_query_map_and_source_recipe():
    from pathlib import Path
    from apps.ravel.recipe_suggestions import recipe_suggestion, RecipeSuggestion
    snapshot = capture(Path(__file__).resolve().parents[3] / 'examples/search-flow')
    snapshot['analysis'] = parse(snapshot['files']); snapshot['id'] = 'search-snapshot'
    feature = next(f for f in make_features(snapshot) if f['paths'][0] == 'Search.tsx')
    feature['id'] = 'search-feature'
    graph = feature_map(snapshot, feature)
    assert any(e['kind'] == 'inferred' and e['to'] == 'api.py' for e in graph['edges'])
    proposal = RecipeSuggestion.model_validate(recipe_suggestion(snapshot, feature))
    assert proposal.request_paths == ['/api/search']
    assert [(s.action, s.name) for s in proposal.steps] == [('fill', 'Search query'), ('click', 'Search')]
    assert proposal.citations and not any(s.action == 'assert' for s in proposal.steps)


def test_literal_paths_do_not_invent_dynamic_or_external_routes():
    from apps.ravel.maps import literal_requests
    assert list(literal_requests('fetch("/users/" + userId)')) == []
    assert list(literal_requests('fetch("https://example.com/api/search")')) == []
    assert list(literal_requests('fetch("//example.com/api/search")')) == []
    assert list(literal_requests('fetch("/api/search?q=" + query)')) == [('/api/search', 1)]


def test_missing_evidence_has_empty_proposal_and_no_photo_defaults():
    from apps.ravel.recipe_suggestions import recipe_suggestion
    snapshot = {'id': 'empty', 'digest': 'empty', 'files': [], 'analysis': {'edges': [], 'routes': []}}
    proposal = recipe_suggestion(snapshot, {'id': 'feature', 'title': 'Unknown', 'paths': []})
    assert proposal['steps'] == [] and proposal['request_paths'] == []
    assert len(proposal['limitations']) == 4


def test_dynamic_button_does_not_borrow_an_input_label():
    from apps.ravel.recipe_suggestions import recipe_suggestion
    body = '<label>Search query<input /></label><button>{dynamicTitle}</button>'
    snapshot = {'id': 'snapshot', 'digest': 'digest', 'files': [{'path': 'App.tsx', 'body': body, 'lines': 1}], 'analysis': {'edges': [], 'routes': []}}
    proposal = recipe_suggestion(snapshot, {'id': 'feature', 'title': 'Unknown button', 'paths': ['App.tsx']})
    assert not any(s['action'] == 'click' for s in proposal['steps'])


def test_disposable_search_response_contracts():
    from apps.ravel.reference import create_reference
    for variant, status in [('correct', 200), ('ambiguous', 200), ('broken', 500)]:
        with TestClient(create_reference(variant, 'search')) as client:
            response = client.get('/api/search?q=React')
            assert response.status_code == status
            if variant == 'correct': assert response.json() == {'results': ['React']}
            if variant == 'ambiguous': assert 'items' in response.json() and 'results' not in response.json()


def test_baseline_recipe_is_additive():
    recipe = RecipeInput(feature_id='feature', label='Normal Search', url='http://localhost:5173', scenario='ordinary', request_path='/api/search', steps=[Step(action='click', name='Search')])
    assert recipe.scenario == 'ordinary'
