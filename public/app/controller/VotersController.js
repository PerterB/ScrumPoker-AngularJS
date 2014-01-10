PlanningApp.app.controller('VotersController', function ($scope, $window, socket, VotingModel) {

    $scope.model = VotingModel;

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
    };

    /**
    * When the scrum master reveals the vote
    *
    */
    $scope.onReveal = function() {

        $scope.model.hideVotes = false;

    };

    /**
     * When a new vote begins
     */
    $scope.onBeginVote = function() {
        $scope.model.hideVotes = true;
        $scope.model.votes = {};
    };

    //SOCKET EVENTS
    socket.on('vote', $scope.onVote);
    socket.on('reveal', $scope.onReveal);
    socket.on('beginVote', $scope.onBeginVote);

    /**
     * Remove all socket listeners on destroy
     */
    $scope.$on('$destroy', function (event) {
        socket.removeAllListeners();
    });

    $scope.filterCurrentUser = function($user) {
        return $user !== $scope.$parent.model.username;
    };

});