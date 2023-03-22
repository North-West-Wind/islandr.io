const http = require("http");
const fs = require("fs");
const mimetypes = require("mime-types");
console.log("http server on port 8000");
http.createServer(function(req, res){
    var index = fs.readFileSync("client/index.html");
    console.log(`Incoming request to ${req.url}`)
    if(req.url == "/"){
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(index);
        res.end()
    }
    else{
        try{
            var data = fs.readFileSync("client" + req.url);
            var ext = req.url.split(".");
            ext = ext[ext.length-1];
            res.writeHead(200, {'Content-Type': mimetypes.lookup(ext)});
            res.write(data);
            res.end()
        }
        catch(e){
            res.writeHead(404, {'Content-Type': "text/plain"});
            res.end();
        }
    }
}).listen(8000);