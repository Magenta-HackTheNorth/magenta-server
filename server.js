var http = require('http'),
	fs = require('fs'),
	cache = {},
	elementStack = [];

var server = http.createServer(function(req, res) {
	var filePath = false;
	console.log(req.url);


	if (req.url === '/') {
		filePath = './client/index.html';
		res.writeHead(200, {'content-type': 'text/html'});
		res.end(getFileData(filePath));
	} 

	var sourcesFolder = req.url.split('/')[1]
	console.log(sourcesFolder);
	filePath = './client' + req.url;

	if (sourcesFolder === 'src') {
		loadScript(res, filePath);
	}

	if (sourcesFolder === 'style') {
		loadStyles(res, filePath);
	}

	if (req.method === 'GET') {
		if (req.url === '/poll') {
			res.writeHead(200, {'content-type': 'application/json'});
			console.log(elementStack);
			res.end(JSON.stringify({msg: "hello"}));
			elementStack = [];
		}
	}

	if (req.method == "POST") {
		var requestBody = "";

		req.on('data', function(d) {
			requestBody += d.toString('utf8');
			//this makes sure the response is not an infinitely large file
			if (requestBody.length > 1e7) {
				res.writeHead(200, {"content-type" : "text/plain"});
				res.end('your post data was very long');
			}
		});

		req.on('end', function() {
			elementStack.push(requestBody);
		})
	}

}).listen(1337, "127.0.0.1");
console.log("Server Running on Port: 1337");

function loadScript(response, absPath) {
	response.writeHead(200, {"content-type": "application/javascript"});
	response.end(getFileData(absPath));
}

function loadStyles(response, absPath) {
	response.writeHead(200, {"content-type": "text/css"});
	response.end(getFileData(absPath));
}

function getFileData(absPath) {
	var data = fs.readFileSync(absPath);
	return data.toString('utf8');
}

// *** TESTING POST ***

setInterval(runTest, 2000);

function runTest() {
	var opts = {
	  host: 'localhost',
	  port: 1337,
	  path: '/elements',
	  method: 'POST',
	  headers: {'content-type':'application/json'}
	}

	var req = http.request(opts, function(res) {
		var data = "";
		res.setEncoding('utf8');
		res.on('data', function(d) {
			data += d;
		})
		console.log(data)
	})

	req.on('error', function(err) {
		console.log("you fucked this up. How could you?");
	})

	req.write('{"intent": "select", "elementID": "5"}');
	req.end();
}


