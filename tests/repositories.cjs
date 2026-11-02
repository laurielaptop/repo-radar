const {readFileSync}=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const elements=new Map();
const element=id=>{if(!elements.has(id))elements.set(id,{value:id==='sort'?'activity':'',classList:{toggle(){}},setAttribute(){},addEventListener(){},close(){}});return elements.get(id)};
const fixtures=Array.from({length:137},(_,i)=>({id:i,node_id:`node${i}`,name:`repo${i}`,private:i%2===0,owner:{login:i%3?'personal':'organization'},updated_at:new Date().toISOString(),html_url:`https://github.com/owner/repo${i}`}));
let pages=[],batches=0,requests=[];
const context=vm.createContext({document:{getElementById:element,querySelectorAll:()=>[]},URL,Date,setTimeout,clearTimeout,AbortController,console,fetch:async(url,options)=>{requests.push({url,options});let data;if(url.endsWith('/user'))data={login:'tester'};else if(url.includes('/user/repos?')){const u=new URL(url);assert.equal(u.searchParams.get('visibility'),'all');assert.equal(u.searchParams.get('affiliation'),'owner,collaborator,organization_member');const page=Number(u.searchParams.get('page'));pages.push(page);data=fixtures.slice((page-1)*100,page*100)}else{batches++;if(batches===2)throw Error('Counts not permitted');const ids=JSON.parse(options.body).variables.ids;data={data:{nodes:ids.map(id=>({id,issues:{totalCount:4},milestones:{totalCount:2}}))}}}return {ok:true,json:async()=>data}}});
(async()=>{vm.runInContext(readFileSync('dist/app.js','utf8'),context);const result=await vm.runInContext('authenticated()',context);assert.equal(result.all.length,137);assert.deepEqual(pages,[1,2]);assert.equal(batches,4);assert.equal(result.failed,40);assert.equal(result.all[0].issues,4);assert.equal(result.all[40].issues,null);assert(result.all.some(r=>r.owner==='organization'));assert(result.all.some(r=>r.isPrivate));assert.equal(result.login,'tester');
assert(requests.every(r=>r.url.startsWith('https://api.github.com/')));
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
vm.runInContext("token='test-secret';username='tester';mode='token';repos=[];disconnect()",context);assert.equal(vm.runInContext('host.rest',context),'https://api.github.com');assert.equal(element('domain').value,'');assert.equal(vm.runInContext('token',context),'');assert.equal(vm.runInContext('username',context),'');assert.equal(vm.runInContext('mode',context),'demo');assert.equal(vm.runInContext('repos.length',context),7);assert.equal(element('disconnect').hidden,true);assert.equal(element('connection').textContent,'Signed out · No token');console.log('PASS: enterprise REST/GraphQL routing, token isolation, domain validation, host help and reset; sign-out clears credentials and restores demo;  pagination beyond 100, mixed owners and visibility, all batches, and repository preservation when counts fail.');})().catch(e=>{console.error(e);process.exitCode=1});
