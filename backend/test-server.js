const http = require('http');
const server = http.createServer((req,res)=>{
  res.writeHead(200, {'Content-Type':'application/json'});
  res.end(JSON.stringify({ok:true}));
});
server.listen(5001, ()=>console.log('test server listening on 5001'));
