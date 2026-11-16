const {readFileSync}=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const elements=new Map();
const element=id=>{if(!elements.has(id))elements.set(id,{value:id==='sort'?'activity':'',classList:{toggle(){}},setAttribute(){},addEventListener(){},close(){}});return elements.get(id)};
const fixtures=Array.from({length:137},(_,i)=>({id:i,node_id:`node${i}`,name:`repo${i}`,private:i%2===0,owner:{login:i%3?'personal':'organization'},updated_at:new Date().toISOString(),html_url:`https://github.com/owner/repo${i}`}));
let pages=[],batches=0,requests=[];
const label=name=>({name});
const taggedIssues=[
  {labels:[label('Status: Ready'),label('READY')]},
  {labels:[label('status-blocked'),label('status_ready')]},
  {labels:[label('already'),label('unblocked')]},
  {labels:[label('blocked')],pull_request:{}}
];
const context=vm.createContext({
  document:{getElementById:element,querySelectorAll:()=>[]},
  URL,Date,setTimeout,clearTimeout,AbortController,console,
  fetch:async(url,options)=>{
    requests.push({url,options});
    const {pathname,searchParams}=new URL(url);
    let data;
    if(pathname.endsWith('/user'))data={login:'tester'};
    else if(pathname.endsWith('/user/repos')){
      assert.equal(searchParams.get('visibility'),'all');
      assert.equal(searchParams.get('affiliation'),'owner,collaborator,organization_member');
      const page=Number(searchParams.get('page'));
      pages.push(page);
      data=fixtures.slice((page-1)*100,page*100);
    }else if(pathname.endsWith('/users/tester/repos'))data=fixtures.slice(0,3);
    else if(pathname.endsWith('/issues')){
      assert.equal(searchParams.get('state'),'open');
      const repo=Number(pathname.match(/repo(\d+)\/issues$/)[1]);
      const page=Number(searchParams.get('page'));
      if(repo===2||repo===80)throw Error('Issues not permitted');
      if(repo===0) data=page===1
        ? [...taggedIssues,...Array.from({length:96},()=>({labels:[]}))]
        : [{labels:[label('Blocked')]},{labels:[label('ready')]}];
      else data=repo===1?[]:taggedIssues;
    }else if(pathname.endsWith('/milestones'))data=[{}];
    else{
      assert(pathname.endsWith('/graphql'));
      batches++;
      if(batches===2)throw Error('Counts not permitted');
      const ids=JSON.parse(options.body).variables.ids;
      data={data:{nodes:ids.map(id=>({id,issues:{totalCount:id==='node1'?0:3},milestones:{totalCount:2}}))}};
    }
    return {ok:true,json:async()=>data};
  }
});
(async()=>{vm.runInContext(readFileSync('dist/app.js','utf8'),context);const result=await vm.runInContext('authenticated()',context);assert.equal(result.all.length,137);assert.deepEqual(pages,[1,2]);assert.equal(batches,4);assert.equal(result.failed,42);
assert.equal(result.all[0].issues,101);
assert.equal(result.all[0].ready,3);
assert.equal(result.all[0].blocked,2);
assert.equal(result.all[1].ready,0);
assert.equal(result.all[1].blocked,0);
assert.equal(result.all[2].issues,3);
assert.equal(result.all[2].ready,null);
assert.equal(result.all[2].blocked,null);
assert.equal(result.all[40].issues,3);
assert.equal(result.all[40].milestones,null);
assert.equal(result.all[80].milestones,2);assert(result.all.some(r=>r.owner==='organization'));assert(result.all.some(r=>r.isPrivate));assert.equal(result.login,'tester');
assert(requests.every(r=>r.url.startsWith('https://api.github.com/')));
assert(!requests.some(r=>r.url.includes('/repo1/issues')));
const publicResult=await vm.runInContext("username='tester';publicRepos()",context);
assert.equal(publicResult.failed,1);
assert.equal(publicResult.all[0].issues,101);
assert.equal(publicResult.all[0].ready,3);
assert.equal(publicResult.all[0].blocked,2);
assert.equal(publicResult.all[1].ready,0);
assert.equal(publicResult.all[2].ready,null);
assert.equal(publicResult.all[2].milestones,1);
context.publicResult=publicResult;
vm.runInContext('repos=publicResult.all;render()',context);
assert.match(element('rows').innerHTML,/Ready <b>3<\/b> · Blocked <b>2<\/b>/);
assert.match(element('rows').innerHTML,/Ready <b>—<\/b> · Blocked <b>—<\/b>/);

for(const domain of ['github.corp.example','https://github.corp.example/','github.corp.example:8443','team.ghe.com']){
context.domain=domain;pages=[];batches=0;requests=[];
vm.runInContext("host=githubHost(domain);token='enterprise-secret'",context);
const enterprise=await vm.runInContext('authenticated()',context);
assert.equal(enterprise.all.length,137);
const origin=domain.includes('8443')?'https://github.corp.example:8443':domain==='team.ghe.com'?'https://api.team.ghe.com':'https://github.corp.example';
const rest=domain==='team.ghe.com'?origin:origin+'/api/v3';
const graphql=domain==='team.ghe.com'?origin+'/graphql':origin+'/api/graphql';
assert(requests.some(r=>r.url===rest+'/user'));
assert(requests.some(r=>r.url===graphql));
assert(requests.every(r=>r.url.startsWith(origin+'/')&&r.options.headers.Authorization==='Bearer enterprise-secret'&&r.options.redirect==='error'));
}
for(const domain of ['http://github.corp.example','https://user:pass@github.corp.example','https://github.corp.example/org/repo','https://github.corp.example?x=1','https://github.corp.example/#fragment']){context.domain=domain;assert.throws(()=>vm.runInContext('githubHost(domain)',context))}
vm.runInContext("$('domain').value='github.corp.example';updateHostHelp()",context);
assert.equal(element('token-help').href,'https://github.corp.example/settings/tokens');
vm.runInContext("token='test-secret';username='tester';mode='token';repos=[];disconnect()",context);assert.equal(vm.runInContext('host.rest',context),'https://api.github.com');assert.equal(element('domain').value,'');assert.equal(vm.runInContext('token',context),'');assert.equal(vm.runInContext('username',context),'');assert.equal(vm.runInContext('mode',context),'demo');assert.equal(vm.runInContext('repos.length',context),7);assert.equal(element('disconnect').hidden,true);assert.equal(element('connection').textContent,'Signed out · No token');console.log('PASS: paginated Ready and Blocked counts in authenticated and public views, label variants, deduplication, PR exclusion and unavailable counts; enterprise REST/GraphQL routing, token isolation, domain validation, host help and reset; sign-out clears credentials and restores demo;  pagination beyond 100, mixed owners and visibility, all batches, and repository preservation when counts fail.');})().catch(e=>{console.error(e);process.exitCode=1});
