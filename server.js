var fs = require('fs');
var http = require('http');
var url = require('url');

var getdate = function(){
	return new Date().toISOString();
};

var files = [];
fs.readdir('.', function(err, f){
	if(!err) files = f;
});

var listen = function(port, handlers) {
	var s = http.createServer(function (req, res) {
/*
'$remote_addr - $remote_user [$time_local] "$request" '
'$status $body_bytes_sent "$http_referer" '
'"$http_user_agent" $http_x_forwarded_for $host';
*/
		console.log(req.connection.remoteAddress, '', '', '[' + getdate() + ']', '"' + req.method + ' ' + req.url + ' ' + 'HTTP/' + req.httpVersion + '"', '???', 0, '"' + (req.headers['referer'] || '-') + '"', '"' + (req.headers['user-agent'] || '-') + '"', req.headers['x-forwarded-for'] || '-', req.headers['host'] || '-');

		serve(handlers, req, res);
	});
	s.trylisten = function(){
		return s.listen(port);
	};
	s.on('listening', function(){
		console.log('Listening on ' + port);
	});
	s.on('error', function (e) {
		if (e.code == 'EADDRINUSE') {
			console.log('port in use:', port);
			setTimeout(function () {
				s.close();
				s.trylisten();
			}, 1000);
		}
	});
	s.trylisten();
};

var serve = function(handlers, req, res) {
	var pathname = url.parse(req.url).pathname;
	console.log('pathname:', pathname);
	if (typeof handlers[pathname] === 'function') {
		handlers[pathname](req, res);
	} else {
		var idx = files.indexOf(pathname.substr(1));
		if(idx != -1) {
			var filename = files[idx];
			res.writeHead(200);
			fs.createReadStream(filename).pipe(res);
			console.log('Static file:', filename);
			return;
		}
		console.log('No matching handler.');
		res.writeHead(404, {'Content-Type': 'text/plain'});
		res.write('file not found');
		res.end();
	}
};

exports.listen = listen;

