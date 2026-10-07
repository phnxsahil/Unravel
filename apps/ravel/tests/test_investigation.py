"""Bounded investigation tests use a fake provider, never paid model requests."""
import asyncio,json
from types import SimpleNamespace
from unittest.mock import AsyncMock
import anthropic,pytest
from apps.ravel.ai import investigate,SourceRequest,SourceRequests
from pydantic import ValidationError

def snapshot():
    body='\n'.join(['# context']*54+['def late_symbol(): return 42'])
    return {'id':'immutable','files':[{'path':'a.py','body':body,'lines':55}], 'analysis':{'symbols':[{'path':'a.py','name':'late_symbol','line':55,'end_line':55}],'edges':[]}}

def response(data):return SimpleNamespace(content=[SimpleNamespace(type='text',text=json.dumps(data))],usage=SimpleNamespace(input_tokens=123,output_tokens=45))
def final(path='a.py',line=55):return {'summary':'Late source','claims':[{'text':'The function returns 42','kind':'source','citations':[{'path':path,'line':line,'end_line':line}]}],'questions':['Where is it used?'],'experiment':'Inspect the caller before choosing a browser recipe.'}
def install(monkeypatch,values):
    calls=AsyncMock(side_effect=values)
    class Client:
        messages=SimpleNamespace(create=calls)
        async def __aenter__(self):return self
        async def __aexit__(self,*args):pass
    monkeypatch.setenv('ANTHROPIC_API_KEY','fake-test-key')
    monkeypatch.setattr(anthropic,'AsyncAnthropic',lambda **kw:Client())
    return calls

def test_retrieves_late_source_and_records_actual_response_usage(monkeypatch):
    calls=install(monkeypatch,[response({'requests':[{'kind':'symbol','path':'a.py','query':'late_symbol'}]}),response(final())]);metrics=[]
    result=asyncio.run(investigate('What returns 42?',snapshot(),['a.py'],'fake-model',metrics.append))
    assert calls.await_count==2 and result['rounds']==2
    assert result['usage']=={'input_tokens':246,'output_tokens':90}
    assert result['snapshot_id']=='immutable' and result['prompt_version']=='unravel-investigator-2'
    assert result['source_tools'][0]['found']==1 and len(metrics)==2
    assert 'def late_symbol' in calls.call_args.kwargs['messages'][-1]['content']

@pytest.mark.parametrize('data',[final('invented.py',55),final('a.py',100)])
def test_bad_locations_rejected_even_after_retrieval(monkeypatch,data):
    install(monkeypatch,[response({'requests':[{'kind':'search','query':'late_symbol'}]}),response(data)])
    with pytest.raises(ValueError,match='outside'):asyncio.run(investigate('What returns 42?',snapshot(),['a.py'],'fake-model'))

def test_model_cannot_read_outside_snapshot(monkeypatch):
    install(monkeypatch,[response({'requests':[{'kind':'symbol','path':'../private','query':'secret'}]})])
    with pytest.raises(ValueError,match='captured snapshot'):asyncio.run(investigate('What is this?',snapshot(),['a.py'],'fake-model'))

def test_three_round_limit_never_retries_forever(monkeypatch):
    tool=response({'requests':[{'kind':'search','query':'missing'}]});calls=install(monkeypatch,[tool,tool,tool])
    with pytest.raises(ValueError,match='three rounds'):asyncio.run(investigate('Where is this?',snapshot(),['a.py'],'fake-model'))
    assert calls.await_count==3

def test_token_budget_prevents_dispatch_and_tool_extra_fields_rejected(monkeypatch):
    calls=install(monkeypatch,[]);monkeypatch.setenv('UNRAVEL_INPUT_TOKEN_LIMIT','4000');large=snapshot();large['files'][0]['body']='x'*5000
    with pytest.raises(ValueError,match='token budget'):asyncio.run(investigate('What is this?',large,['a.py'],'fake-model'))
    assert calls.await_count==0
    with pytest.raises(ValidationError):SourceRequest(kind='search',query='x',command='arbitrary command')
