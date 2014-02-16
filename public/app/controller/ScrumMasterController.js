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

            // request a list of available scopes
            socket.emit('scopesRequest');

            //also request a list of statuses
            socket.emit('statusRequest');
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

        $scope.reset();

    };

    /**
     * When the provider returns a list of scopes
     */
    $scope.onScopesResponse = function(scopes) {
        if (scopes) {
            $scope.model.scopes = scopes;
            $scope.model.simpleMode = false;

            // watch the currentScope model value for changes
            // request a list of backlogs for the selected scope on select
            $scope.$watch('model.currentScope', function(newValue) {
                if (newValue) {
                    socket.emit('backlogRequest', $scope.model.currentScope);
                }
            });
        }
    };

    $scope.onStatusResponse = function(statuses) {
        if (statuses) {
            $scope.model.statuses = statuses;
        }
    };

    //SOCKET EVENTS
    socket.on('connect', $scope.onConnect);
    socket.on('login', $scope.onLogin);
    socket.on('logout', $scope.onLogout);
    socket.on('vote', $scope.onVote);
    socket.on('scopesResponse', $scope.onScopesResponse);
    socket.on('backlogResponse', $scope.onBacklogResponse);
    socket.on('statusResponse', $scope.onStatusResponse);

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

        // backlogNumber is either coming from the input element or is set in beginBacklogVote
        $scope.model.currentBacklog = $scope.model.backlogNumber;
		socket.emit('beginVote', backlog || $scope.model.backlogNumber, $scope.model.defaultVotingOption.values);
	};

    /**
     * Set the current backlog - called when user clicks the 'Actions' menu for a backlog.
     * @param backlog
     */
    $scope.setCurrentBacklog = function(backlog) {
        $scope.model.currentBacklog = backlog.id;
        $scope.model.backlogNumber = backlog.id;
    };

    /**
     * Helper function for resetting, called on begin vote and on saveVote
     */
    $scope.reset = function() {
        $scope.model.hideVotes = true;
        $scope.model.hideSummary = true;
        $scope.model.votes = {};
        $scope.model.disableReveal = true;
        $scope.model.currentBacklog = undefined;
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

        thisBacklog = $scope.getSelectedBacklog();
        if (thisBacklog) {
            thisBacklog.finalVoteValue = $scope.model.finalVoteValue;
            socket.emit('backlogReadyRequest', {
                backlogId: thisBacklog.assetId.split(':')[1],
                estimate: $scope.model.finalVoteValue,
                status: 'Sprint Ready' // TODO: really?
            });
        }

        $scope.reset();
	};

    /**
     * Emit a request to update the status of the backlog.
     */
    $scope.changeBacklogStatus = function() {
        var thisBacklog = $scope.getSelectedBacklog();

        if (thisBacklog) {
            socket.emit('changeStatus', {
                statusName: $scope.model.currentStatus.name,
                backlogId: thisBacklog.assetId.split(':')[1]
            });
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

    $scope.getSelectedBacklog = function() {
        var selectedBacklog;
        if ($scope.model.preparedBacklogs) {
            for (var i = 0; i < $scope.model.preparedBacklogs.length; i++) {
                if ($scope.model.backlogNumber === $scope.model.preparedBacklogs[i].id) {
                    selectedBacklog = $scope.model.preparedBacklogs[i];
                    break;
                }
            }
        }
        return selectedBacklog;
    };
});