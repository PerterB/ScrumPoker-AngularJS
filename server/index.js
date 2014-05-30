var express = require('express'), 
	app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    socketEvents = require('./lib/socketEvents'),
    port = 3000;

server.listen(port);

/*
 * Configure Express
 */
app.set('views', __dirname + '/../views');
app.set('view engine', 'ejs');
app.set("view options", {
    layout: true
});
app.configure(function() {
    app.use(express.static(__dirname + '/../public'));
});

/*
 * Routes
 */
var routes = {
	'/': function(req, res) {
		res.render('index');
	},
    '/help': function(req, res) {
        res.render('help');
    },
	'/vote/:room' : function(req, res) {
		res.render('vote', { users: socketEvents.allClients[req.params.room] || []});
	},
	'/scrummaster/:room' : function(req, res) {
		console.log(socketEvents.allClients[req.params.room])
	    res.render('scrummaster', { users: socketEvents.allClients[req.params.room] || []});
	}
};
socketEvents.routeEvents.call(null, routes, app.get, app);

/*
 * Configure Socket.io
 */
io.sockets.on('connection', socketEvents.setupConnections);

console.log('Listening on port ' + port);
