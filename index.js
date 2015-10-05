var server = require('./server');
var handlers = require('./handlers').map;

server.listen(15105, handlers);
