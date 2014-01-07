PlanningApp.app.controller('ClientController', function ($scope, $window, socket, ClientModel, VotingModel) {

    $scope.model = ClientModel;

    $scope.votingModel = VotingModel;

    /**
     * onConnect
     *
     * Extract the room from the path and join
     * TODO: What if no room?
     */
    $scope.onConnect = function() {

        var room = $window.location.pathname.split( '/' )[2];

        socket.emit('room', room);
    };

    /**
     * onLogin
     *
     * When a user logs in, add their name to the list of users
     * @param rm room name
     * @param username name of the user who has just logged in
     */
    $scope.onLogin = function(username) {
        $scope.model.loggedInUsers.push(username);

//        // call logoff on unload
//        window.onbeforeunload = (function(name) {
//            return function() {
//                socket.emit('logoff', name);
//            }
//        })(username);
    };

    /**
     * When a users logs out remove their name from the list
     * @param username
     */
    $scope.onLogout = function(username) {

        // remove the user from the list
        var index = $scope.model.loggedInUsers.indexOf(username);
        if (index !== -1) {
            $scope.model.loggedInUsers.splice(index, 1);
        }
    };

    /**
     * When a vote begins, setup the page
     *
     * @param backlogNumber
     */
    $scope.onBeginVote = function(backlogNumber) {
        $scope.model.votingOpen = true;
        $scope.model.currentVote = backlogNumber;
        $scope.model.currentVote = backlogNumber;
        $scope.model.showCurrentVote = true;
        $scope.model.showVoteSentMessage = false;
        $scope.model.showSummary = false;
    };

    /**
     * When the scrum master reveals the vote
     * close voting and show the summary.
     *
     * @param summaryData
     */
    $scope.onReveal = function(summaryData) {

        $scope.model.votingOpen = false;
        $scope.model.statusMessage = 'Voting has now closed.';

        $scope.model.showSummary = true;
        $scope.model.summaryText = summaryData;

    };

    /**
     * onFinalVote
     * When the vote is finalized, add it to the log
     *
     * @param voteDetails Details of the final vote
     */
    $scope.onFinalVote = function(voteDetails) {

        $scope.model.showVoteLog = true;
        $scope.model.voteLog.push(voteDetails);
    };

    socket.on('connect', $scope.onConnect);
    socket.on('login', $scope.onLogin);
    socket.on('logout', $scope.onLogout);
    socket.on('beginVote', $scope.onBeginVote);
    socket.on('reveal', $scope.onReveal);
    socket.on('finalVote', $scope.onFinalVote);

    /**
     * Remove all socket listeners on destroy
     */
    $scope.$on('$destroy', function (event) {
        socket.removeAllListeners();
    });




    /**
     * When the user sets their login name.
     */
    $scope.login = function() {

        if ($scope.model.username !== '') {

            if ($scope.model.loggedInUsers.indexOf($scope.model.username) === -1) {
                socket.emit('login', $scope.model.username);

                $scope.model.showErrorMessage = false;
                $scope.model.statusMessage = 'Please wait for voting to open...';
                $scope.model.showStatusMessage = true;
                $scope.model.loggedIn = true;

                $scope.model.loggedInUsers.push($scope.model.username);
            } else {
                $scope.showErrorMessage('That name is already taken, try again');
            }
        }
    };

    /**
     * Show an error message
     * @param message the error message to display
     */
    $scope.showErrorMessage = function(message) {
        $scope.model.errorMessage = message;
        $scope.model.showErrorMessage = true;
    };

    /**
     * Cast a vote
     * Display the 'Vote Cast' message
     * Hide the voting options
     */
    $scope.sendVote = function(value) {
        socket.emit('vote', value);
        $scope.model.voteSentMessage = 'Your vote ' + value + ' has been cast. You can still change your vote before voting closes';
        $scope.model.showVoteSentMessage = true;
    };
});