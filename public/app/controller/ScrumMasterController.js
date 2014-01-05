PlanningApp.app.controller('ScrumMasterController', function ($scope, $window, socket, VotingModel) {

    $scope.model = VotingModel;

    /**
     * onConnect
     * join the room and request backlogs
     *
     */
    $scope.onConnect = function() {
        var room = $window.location.pathname.split( '/' )[2];
        if (room) {
            //join the room
            socket.emit('room', room);

            //request backlogs
            socket.emit('backlogRequest');
        }
    };

    /**
     * onLogin
     * Add the given username to the list of logged in users
     * @param username
     */
    $scope.onLogin = function(username) {
        $scope.model.loggedInUsers.push(username);
    };

    /**
     * onLogout
     * Remove the given username from the list of logged in users
     *
     * @param username
     */
    $scope.onLogout = function(username) {
        var index = $scope.model.loggedInUsers.indexOf(username);
        if (index !== -1) {
            $scope.model.loggedInUsers.splice(index, 1);
        }
    };

    /**
     * onVote
     * Add the vote to the list of votes
     * Enable the 'Reveal' button
     * Work out of the vote is completed or not
     *
     * @param voteData an object with a name and vote value
     */
    $scope.onVote = function(voteData) {

        var user = voteData['login'],
            vote = voteData['vote'];

        $scope.model.votes[user] = vote;
        if ($scope.model.disableReveal) {

            $scope.model.disableReveal = false;
        }
    };

    /**
     * onBacklogResponse
     * Set the list of prepared backlogs in the model
     * Set simpleMode to false
     *
     * @param backlogs a list of prepared backlogs from a backlog provider
     */
    $scope.onBacklogResponse = function(backlogs) {
        $scope.model.preparedBacklogs = backlogs;
        $scope.model.simpleMode = false;
    };


    //SOCKET EVENTS
    socket.on('connect', $scope.onConnect);
    socket.on('login', $scope.onLogin);
    socket.on('logout', $scope.onLogout);
    socket.on('vote', $scope.onVote);
    socket.on('backlogResponse', $scope.onBacklogResponse);

    /**
     * Remove all socket listeners on destroy
     */
    $scope.$on('$destroy', function (event) {
        socket.removeAllListeners();
    });

	/**
	 * When a new vote begins.
	 * Reset topic
	 */
	$scope.beginVote = function() {

		$scope.reset();

        $scope.model.currentBacklog = $scope.model.backlogNumber;
		socket.emit('beginVote', $scope.model.backlogNumber, $scope.model.defaultVotingOption.values);
	};

    /**
     * Helper function for resetting, called on begin vote and on saveVote
     */
    $scope.reset = function() {
        $scope.model.hideVotes = true;
        $scope.model.hideSummary = true;
        $scope.model.votes = {};
        $scope.model.disableReveal = true;
    };

	$scope.beginBacklogVote = function(backlog) {
		
		$scope.model.backlogNumber = backlog.id;
        $scope.beginVote();
	};

	/**
	 * Reveal all Votes
	 */
	$scope.revealVotes = function() {
		
		$scope.model.hideVotes = false;
		$scope.model.hideSummary = false;
        $scope.model.disableReveal = true;

		$scope.generateVoteStats();

        socket.emit('reveal', $scope.model.summaryText);
		
	};
	
	$scope.saveVote = function() {
		var finalVoteObj = {
            backlogNumber: $scope.model.backlogNumber,
            finalVote: $scope.model.finalVoteValue
        };
		$scope.model.voteLog.push(finalVoteObj);
		localStorage['voteLog'] = JSON.stringify($scope.model.voteLog);

        socket.emit('finalVote', finalVoteObj);

        $scope.reset();
	};
	
	$scope.clearLog = function() {
		
		$scope.model.voteLog = [];
		localStorage['voteLog'] = '';
	};
	
	/**
	 * Display a summary of the estimates
	 * @param votes
	 */
	$scope.generateVoteStats = function() {
		
		var finalVotes = {}, value, summary = [];
		
		for (var vote in $scope.model.votes) {
			
			if ($scope.model.votes.hasOwnProperty(vote)) {
				
				value = $scope.model.votes[vote];
				
				if (!finalVotes[value]) {
					
					finalVotes[value] = 1;
					
				} else {
					
					finalVotes[value] += 1;
					
				}
			}
		}
		
		for (var est in finalVotes) {
			
			if (finalVotes.hasOwnProperty(est)) {
				
				if (finalVotes[est] === 1) {
					
					summary.push('1 person voted: ' + est);
					
				} else {
					
					summary.push(finalVotes[est] + ' people voted: ' + est);
					
				}
				
			}
			
		}
		
		if (summary.length === 0) {
			summary.push('Nobody voted...');
		}
		$scope.model.summaryText = summary;
	};

});