/**
 * Socket Events
 */
var escape = require('escape-html');

module.exports = (function() {
	
	/**
	 * Object to maintain state of currently logged in users
	 */
	var allClients = {};
	
	/**
	 * Function for mapping object properties to functions. 
	 * This is used for routing paths to functions for the Express server,
	 * and also for the mapping socket events to functions.
	 * 
	 * @param routes - This is an string->function map.
	 * @param setupFn - This function will be called and passed the above 'string' and 'function' as params.
	 * @param scope -The scope for the setupFn call.
	 */
	var routeEvents = function(routes, setupFn, scope) {
		
		for (var prop in routes) {
			if (routes.hasOwnProperty(prop)) {
				setupFn.call(scope, prop, routes[prop]);
			}
		}
		
	};
	
	/**
	 * Map socket events to their respective handlers.
	 * Each handler is defined below
	 * 
	 * This is called when a socket connects
	 * 
	 * Usage: 
	 * 
	 * var io = require('socket.io').listen(server),
	 *     socketEvents = require('./lib/socketEvents');
	 *     
	 * io.sockets.on('connection', socketEvents.setupConnections);
	 * 
	 */
	var setupConnections = function(socket) {
		
		routeEvents.call(null, eventMappings, socket.on, socket);
		
	};
	
	/**
	 * Clients must first join a room before they do anything else
	 */
	var joinRoomEvent = function(room) {
		var socket = this;
		socket.room = room;
		socket.join(room);
	};
	
	/**
	 * When a user logs in (enters a username)
	 * 
	 *  - Set the username as a parameter on the socket ('login')
	 *  - Broadcast the event to all clients so they can update their list of online users
	 *  - Add the username to the allClients object keyed by room name (server side list of users)
	 */
	var loginEvent = function(username) {
		
    	var socket = this;
    	
    	username = escape(username);
    	
    	socket.username = username;
    		
        // let scrum master know that user has logged in.
        socket.broadcast.to(socket.room).emit('login', username);
        
        // add this client to the list of users
        if (!allClients[socket.room]) {
        	allClients[socket.room] = [];
        }
        allClients[socket.room].push(username);
    	
    };
    
    /**
     * If the username matches the socket 'username' attribute then disconnect.
     */
    var logoffEvent = function(username) {
    	
    	var socket = this;
    		
		if (socket.username === username) {

			socket.leave(socket.room);
			socket.disconnect();
			
		}
    	
    };
    
    /**
     * Vote Event
     * 
     * Create an object with the username and the vote value and broadcast
     * This event is listened for by the scrum master
     * 
     */
    var voteEvent = function(vote) {
    	
    	var socket = this;
    	
        var data = {
            vote: vote,
            login: socket.username
        };
        socket.broadcast.to(socket.room).emit('vote', data);
        
    };
    
    /**
     * Begin Voting
     * Fires the 'beginVote' event
     * This is listened for by each client
     */
    var beginVoteEvent = function(voteSubject, votingOptions) {
    	
    	var socket = this;
    	socket.broadcast.to(socket.room).emit('beginVote', voteSubject, votingOptions);
    	
    };
    
    
    /**
     * Reveal Event
     * Clients should disable the voting options after the reveal event
     */
    var revealEvent = function(summaryData) {
    	var socket = this;
    	socket.broadcast.to(socket.room).emit('reveal', summaryData);
    };
    
    /**
     * Final Vote Event
     * Clients should log the final vote for the given voting subject
     */
    var finalVoteEvent = function(voteDetails) {
    	
    	var socket = this;
    	socket.broadcast.to(socket.room).emit('finalVote', voteDetails);
    	
    };
    
    
    /**
     * Fire the 'logout' event, passing the name of the user who has logged out, to notify clients that a user has left
     * Remove the logged out user from the allClients object (server side list of users)
     */
    var disconnectEvent = function() {
    	
    	var socket = this;
    	
		var roomClients = allClients[socket.room] || [];
		socket.broadcast.to(socket.room).emit('logout', socket.username);	
		
		// remove the user from the list of clients
		var index = roomClients.indexOf(socket.username);
		if (index !== -1) {
			roomClients.splice(index, 1);
		}
    	
    };
    
    /**
     * Broadcast a request for backlog items
     */
    var backlogRequestEvent = function(scope) {
    	
    	var socket = this;
    	
    	socket.broadcast.to(socket.room).emit('backlogRequest', scope);
    	
    };

    /**
     * When the provider returns a list of backlogs.
     * @param data
     */
    var backlogResponseEvent = function(data) {
    	
    	var socket = this;
    	
    	socket.broadcast.to(socket.room).emit('backlogResponse', data);
    	
    };

    /**
     * Request that a backlog is set to ready?
     * @param backlogData
     */
	var backlogReadyRequestEvent = function(backlogData) {
		
		var socket = this;
		
		socket.broadcast.to(socket.room).emit('backlogReadyRequest', backlogData);
	};

    /**
     * Confirm that backlog is set to ready.
     */
	var backlogReadyResponseEvent = function() {
		var socket = this;
		
		socket.broadcast.to(socket.room).emit('backlogReadyResponse');
	};

    /**
     * When the app loads, request a list of scopes from the provider
     */
    var scopesRequestEvent = function() {
        var socket = this;

        socket.broadcast.to(socket.room).emit('scopesRequest');
    };

    /**
     * When the provider returns a list of scopes
     */
    var scopesResponseEvent = function(scopes) {
        var socket = this;

        socket.broadcast.to(socket.room).emit('scopesResponse', scopes);
    };

    /**
     * Broadcast a request for statuses
     */
    var statusRequestEvent = function(scope) {

        var socket = this;

        socket.broadcast.to(socket.room).emit('statusRequest', scope);

    };

    /**
     * When the provider returns a list of statuses.
     * @param data
     */
    var statusResponseEvent = function(data) {

        var socket = this;

        socket.broadcast.to(socket.room).emit('statusResponse', data);

    };

    /**
     * Change the Status of a backlog
     * @param data - Object containing statusName and backlogNumber
     */
    var changeStatusEvent = function(data) {

        var socket = this;

        socket.broadcast.to(socket.room).emit('changeStatus', data);
    };
	
    /**
	 * Mapping of event name to handlers
	 */
	var eventMappings = {
			
		'room': joinRoomEvent,

		'login': loginEvent,
	    
	    'logoff': logoffEvent,

	    'vote': voteEvent,

	    'beginVote': beginVoteEvent,
	    
	    'reveal': revealEvent,
	    
	    'finalVote': finalVoteEvent,

	    'disconnect': disconnectEvent,
	    
	    'backlogRequest': backlogRequestEvent,
	    
	    'backlogResponse': backlogResponseEvent,
		
		'backlogReadyRequest': backlogReadyRequestEvent,
		
		'backlogReadyResponse': backlogReadyResponseEvent,

        'scopesRequest': scopesRequestEvent,

        'scopesResponse': scopesResponseEvent,

        'statusRequest' : statusRequestEvent,

        'statusResponse' : statusResponseEvent,

        'changeStatus' : changeStatusEvent
	};
	
	return {
		routeEvents: routeEvents,
		setupConnections: setupConnections,
		allClients: allClients,
		eventMappings: eventMappings
	};
	
})();