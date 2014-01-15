PlanningApp.app.controller('ScrumMasterController', function ($scope, $window, socket, VotingModel) {

    $scope.model = VotingModel;

    $scope.init = function(loggedInUsers) {

        $scope.model.loggedInUsers = loggedInUsers;

        var currentUrl = $window.location.href;
        if (currentUrl && currentUrl.indexOf('scrummaster')) {
            $scope.votingUrl = currentUrl.replace('scrummaster', 'vote');
        }
    };

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
     * Enable the 'Reveal' button
     */
    $scope.onVote = function() {

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
	$scope.beginVote = function(backlog) {

		$scope.reset();

        $scope.model.currentBacklog = $scope.model.backlogNumber;
		socket.emit('beginVote', backlog || $scope.model.backlogNumber, $scope.model.defaultVotingOption.values);
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

        $scope.beginVote(backlog);
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
        }, thisBacklog;
		
		$scope.model.voteLog.push(finalVoteObj);
		localStorage['voteLog'] = JSON.stringify($scope.model.voteLog);

        socket.emit('finalVote', finalVoteObj);

        if ($scope.model.preparedBacklogs) {
            for (var i = 0; i < $scope.model.preparedBacklogs.length; i++) {
                if ($scope.model.backlogNumber === $scope.model.preparedBacklogs[i].id) {
                    $scope.model.preparedBacklogs[i].finalVoteValue = $scope.model.finalVoteValue;
					thisBacklog = $scope.model.preparedBacklogs[i];
                    break;
                }
            }
			
			socket.emit('backlogReadyRequest', {
				backlogId: thisBacklog.assetId.split(':')[1], 
				estimate: $scope.model.finalVoteValue, 
				status: 'Sprint Ready'
			});
        }


        $scope.reset();
	};

    $scope.saveBacklog = function(backlog) {

        if (backlog.finalVoteValue) {
            console.log('emit save vote', backlog);
            // TODO
        }
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