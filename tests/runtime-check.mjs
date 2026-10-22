const checks=[['API live','http://localhost:4000/api/health/live'],['API health','http://localhost:4000/api/health']];
for(const [name,url] of checks){try{const r=await fetch(url);console.log(`${name}: ${r.ok?'PASS':'FAIL'} (${r.status})`)}catch(e){console.log(`${name}: BLOCKED (${e.message})`)}}
try{const r=await fetch('http://localhost:3000');console.log(`Web: ${r.ok?'PASS':'FAIL'} (${r.status})`)}catch(e){console.log(`Web: BLOCKED (${e.message})`)}
