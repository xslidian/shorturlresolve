
var in_extension = typeof document === 'object' &&
	typeof document.location === 'object' && document.location.protocol === 'chrome-extension:';
console.log('in_extension:', in_extension);

var whitelist = {};

var wsurl = '/';

qqq.onclick = function(){
	return p_c(false, false);
};

ccc.onclick = function(){
	return p_c(false, true);
};

pnc.onclick = function(){
	return p_c(true, true);
};

var p_c = function(p, c){
	if(p){
		iii.select();
		document.execCommand('paste');
	}
	var url = iii.value;
	if(!url) return;
	ooo.value = '';
	return resolve(url, function(r){
		if(r) {
			ooo.value = r;
			ooo.select();
		}
		if(c) {
			(r ? ooo : iii).select();
			document.execCommand('copy');
		}
	});
};

var r2l = function(r){
	console.log('r2l:', r);
	var u = '';
	var hit = r.responseHeaders && r.responseHeaders.length ? r.responseHeaders.some(function(e){
		if(e.name.toLowerCase() == 'location') {
			u = e.value;
			return true;
		}
		return false;
	}) : false;
	return hit ? u : false;
};

var parseurl = function(url){
	var keys = ['href', 'protocol', 'hostname', 'host', 'port', 'pathname', 'search', 'hash'];
	var a = new_('a');
	a.href = url;
	var o = {};
	keys.forEach(function(e){
		o[e] = a[e];
	});
	return o;
};

var resolve = function(url, cb){
	if(typeof cb != 'function') cb = console.log;

	if(!url) return cb('');
	if(url.substr(0, 4) != 'http') {
		if(url.substr(0, 2) != '//') url = '//' + url;
		url = 'http:' + url;
	}

	if(!in_extension) {
		return $.post(wsurl, {
			url: url
		}, function(r){
			cb(r.r == 0 ? r.d : false);
		});
	};

	var c = parseurl(url);
	var urlfilter = '*://' + c.host + '/*';
	url = c.href;
	whitelist[url] = true;

	var blocker = function(r) {
		console.log('blocker:', r.tabId == -1 && r.frameId == 0 && r.parentFrameId == -1 ? r : 'skip');
		return {cancel: r.tabId == -1 && r.frameId == 0 && r.parentFrameId == -1 && !whitelist[r.url] && !whitelist[r.url.replace(/^https/, 'http')]};
	};
	chrome.webRequest.onBeforeRequest.addListener(
		blocker, {
			urls: [
				'*://*/*'
			],
			types: [
				'xmlhttprequest'
			],
			tabId: -1,
			windowId: -1
		}, ['blocking']
	);

	var listener = function(r){
		cb( r2l(r, cb) );
		chrome.webRequest.onHeadersReceived.removeListener(listener);
		setTimeout(function(){
			chrome.webRequest.onBeforeRequest.removeListener(blocker);
		}, 2000);
	};
	chrome.webRequest.onHeadersReceived.addListener(
		listener, {
			urls: [ urlfilter ]
		}, ['responseHeaders']
	);

	return $.ajax({
		type: 'GET',
		url: url
	});
};

var new_ = function(tag, t, parent){
	var e = document.createElement(tag);
	if(t) {
		e.innerText = t;
		if(t.hasOwnProperty && t.hasOwnProperty('html') && typeof t.html !== 'undefined') e.innerHTML = t.html;
	}
	return parent ? parent.appendChild(e) : e;
};

var resize = function(w, h){
	if(document) {
		var html = document.getElementsByTagName('html')[0];
		if(html) {
			html.style.width = w;
			html.style.height = h;
		}
	}
	return window ? [window.innerWidth, window.innerHeight] : [w, h];
};

if(in_extension) resize(300, 100);

//iii.onclick = iii.select;
iii.onclick = ooo.onclick = function() {
	this.select();
};

pnc.style.display = in_extension ? '' : 'none';
ccc.style.display = in_extension ? '' : 'none';
