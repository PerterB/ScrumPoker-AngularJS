var socket = io.connect(),
    loggedIn = false,
    userName = '',
    paths = window.location.pathname.split( '/' ),
    room = paths[2];

var votes = {
	standard: [1,2, 3, 5, 8, 13, 20, 40, 100, '&infin;', '?'],
	tshirt: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '&infin;','?'],
	fibonacci: [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, '&infin;', '?']
};

/**
 * When the user sets their login name.
 */
var setPseudo = function() {
	var pseudoName = $("#pseudoInput").val();
    if (pseudoName != "") {
    	if (loggedInUsers.indexOf(pseudoName) === -1) {
    		userName = pseudoName;
    		socket.emit('login', pseudoName);
            $('#pseudoInput').hide();
            $('#pseudoSet').hide(); 
            $('#errorMessage').hide();
            $('#statusMessage').html('<span class="glyphicon glyphicon-time"></span> &nbsp;Please wait for voting to open...').show();
            $('#loginControls').hide();
            $('#welcome').html('Welcome ' + pseudoName);
            loggedIn = true;
    	} else {
    		$('#errorMessage').html('<span class="glyphicon glyphicon-ban-circle"></span>&nbsp;That name is already taken, try again').show();
    	}
    }
};

/**
 * Render the voting options
 */
var renderVotingOptions = function(votingOptions) {
	
	$('#votingOptions').html('');
	votingOptions = votingOptions || 'standard';
	
	for (var i = 0; i < votes[votingOptions].length; i++) {
		$('#votingOptions').append('<div class=card id=vote' +  votes[votingOptions][i] + ' onclick="vote(\'' + votes[votingOptions][i] + '\')">' + votes[votingOptions][i] + '</div>');
	}
	$('#votingOptions').show();	
};

/**
 * Cast a vote
 * Display the 'Vote Cast' message
 * Hide the voting options
 */
var vote = function(value) {
	socket.emit('vote', value);
	$('#voteSent').html('<span class="glyphicon glyphicon-ok-circle"></span>&nbsp;Your vote <b>' + value + '</b> has been cast. You can still change your vote before voting closes.').show();
};

/**
 * Enable voting options
 */
var enableVote = function(voteSubject, votingOptions) {
	if (loggedIn) {
		$('#statusMessage').html('<span class="glyphicon glyphicon-tag"></span> &nbsp;Current vote: ' + voteSubject).show();
		$('#voteSent').hide();
		renderVotingOptions(votingOptions);		
	}
};

if (room) {
	/**
	 * Join the room on connect
	 */
	socket.on('connect', function() {
		socket.emit('room', room);
	});

	/**
	 * When the vote is finalized add it to the log
	 */
	socket.on('finalVote', function(voteDetails) {
		if (loggedIn) {
			var voteLogPanel = $('#voteLogPanel');
			if (!voteLogPanel.is(':visible')) {
				voteLogPanel.show();
			}
			$('#voteLog').append('Final Vote for <b>' + voteDetails.voteSubject + ' - ' + voteDetails.finalVoteValue + '</b><br />');
		}		
	});

	/**
	 * When a user logs in, add their name to the list of loggedInUsers
	 */
	socket.on('login', function(rm, username) {
		loggedInUsers.push(username);	
		
		window.onbeforeunload = function() {
	    	socket.emit('logoff', userName);
	    };
	});

	/**
	 * When a user logs out, remove their name from the list of loggedInUsers
	 */
	socket.on('logout', function(data) {
		
		// remove the user from the list
		var index = loggedInUsers.indexOf(data);
		if (index !== -1) {
			loggedInUsers.splice(index, 1);
		}
	});

	socket.on('beginVote', enableVote);

	socket.on('reveal', function() {
		if (loggedIn) {
			$('#votingOptions').hide();
			// check logged in
			$('#voteSent').html('<span class="glyphicon glyphicon-ok-circle"></span>&nbsp;Your vote has been cast. Voting has now closed you can no longer change your vote for this story.').show();	
		}
	});

	$(function() {
	    $("#pseudoSet").click(function() {
	        setPseudo();
	        return false;
	    });
	    
	    $('#statusMessage').hide();
	    $('#errorMessage').hide();
	    $('#voteSent').hide();
	    $('#voteLogPanel').hide();
	    
	    
	});
} else {
	
	$('#statusMessage').hide();
    $('#voteSent').hide();
    $('#voteLogPanel').hide();
    
    $('#errorMessage').html('<span class="glyphicon glyphicon-ban-circle"></span>&nbsp;You must join a room').show();
}
