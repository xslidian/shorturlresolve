var formidable = require('formidable'),
	fs = require('fs'),
	http = require('http'),
	path = require('path'),
	querystring = require('querystring'),
	url = require('url');
var tmpdir = '.tmp';
fs.exists(tmpdir, function (exists) {
	if(!exists) fs.mkdir(tmpdir);
});


var cbcb = function(cb){
	return typeof cb === 'function' ? cb : function(){
		console.warn.apply(console, Array.prototype.slice.call(arguments));
	}
};

var getdate = function(){
	return new Date().toISOString();
};

var respjson = function(res, json, dontprint){
	if(!dontprint) console.log('respjson: ', json);
	res.writeHead(200, {'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*'});
	res.write(JSON.stringify(json));
	return res.end();
}

var start = function(req, res) {
	if(req.method.toLowerCase() == 'get') {
		var body = '<html>'+
			'</html>';
		res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
		//res.write(body);
		//res.end();
		fs.createReadStream('./index.html').pipe(res);
	} else{
		var form = new formidable.IncomingForm({
			uploadDir: tmpdir
		});
		console.log('parsing form...');
		form.parse(req, function(error, fields, files) {
			console.log('parsing done', error, fields, files);

			if(error) return respjson(res, {r: -1, a: '', m: '表单数据解析异常'});

			if(fields.hasOwnProperty('url')) return resolve(fields['url'], function(d){
				respjson(res, {r: 0, a: 'url', d: d});
			});

			return respjson(res, {r: -2, a: '', m: '未定义操作'});
		});
	}
}

var resolve = function(u, cb){
	var c = cbcb(cb);
	var p = url.parse(u || '');
	if(['http:', 'https:'].indexOf(p.protocol) == -1 || !p.hostname) return c(false);
	http.get(u, function(res) {
		c(res.headers.location ? res.headers.location : false);
	}).on('error', function(e) {
		c(e.message);
	});
};

var map = {
	'/': start,
	'/resolve': start
};

exports.map = map;
