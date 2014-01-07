/**
 * Created by peter on 04/01/2014.
 */

var io = {connect: function(){}};
var App = {};
App.loggedInUsers = [];



describe('ClientController Tests', function() {

    var scope, window, socket, VotingModel, ClientModel;

    beforeEach(module('planningApp'));

    //setup mocks
    beforeEach(inject(function($controller) {

        scope = {
            $on: jasmine.createSpy()
        };
        window = {
            location: {}
        };
        socket = {
            emit: jasmine.createSpy(),
            on: jasmine.createSpy()
        };
        VotingModel = {};
        ClientModel = {};

        $controller('ClientController', {$scope: scope, $window: window, socket: socket, ClientModel: ClientModel, VotingModel: VotingModel});

    }));

    it('should join the room on connect', function() {

        window.location.pathname = '/some/room';

        scope.onConnect();

        expect(socket.emit).toHaveBeenCalledWith('room', 'room');
    });

    it('should update the list of users when someone logs in', function() {

        scope.model.loggedInUsers = [];

        scope.onLogin('Peter');

        expect(scope.model.loggedInUsers).toEqual(['Peter']);
    });

    it('should update the list of users when someone logs out', function() {

        scope.model.loggedInUsers = ['Peter'];

        scope.onLogout('Peter');

        expect(scope.model.loggedInUsers).toEqual([]);
    });

    it('should not update the list of users when an unknown user logs out', function() {

        scope.model.loggedInUsers = ['Peter'];

        scope.onLogout('Paul');

        expect(scope.model.loggedInUsers).toEqual(['Peter']);
    });

    it('should setup the page when a vote begins', function() {
        scope.onBeginVote('B-1234');

        expect(scope.model.votingOpen).toEqual(true);
        expect(scope.model.currentVote).toEqual('B-1234');
        expect(scope.model.showCurrentVote).toEqual(true);
        expect(scope.model.showVoteSentMessage).toEqual(false);
        expect(scope.model.showSummary).toEqual(false);

    });

    it('should display a summary when the votes are revealed', function() {

        var summaryData = {some: 'data'};

        scope.onReveal(summaryData);

        expect(scope.model.votingOpen).toEqual(false);
        expect(scope.model.statusMessage).toEqual('Voting has now closed.');
        expect(scope.model.showSummary).toEqual(true);
        expect(scope.model.summaryText).toEqual(summaryData);
    });

    it('should add final votes to the log', function() {

        var voteDetails = {some: 'data'};
        scope.model.voteLog = [];

        scope.onFinalVote(voteDetails);

        expect(scope.model.showVoteLog).toEqual(true);
        expect(scope.model.voteLog).toEqual([voteDetails]);

    });

    it('should log a user in', function() {
        scope.model.username = "Peter";
        scope.model.loggedInUsers = [];

        scope.login();

        expect(socket.emit).toHaveBeenCalledWith('login', 'Peter');
        expect(scope.model.showErrorMessage).toBe(false);
        expect(scope.model.showStatusMessage).toBe(true);
        expect(scope.model.loggedIn).toBe(true);
        expect(scope.model.loggedInUsers).toEqual(['Peter']);

    });

    it('should display an error if username is taken', function() {

        scope.model.loggedInUsers = ['Peter'];

        scope.model.username = 'Peter';

        scope.login();

        expect(scope.model.errorMessage).toEqual('That name is already taken, try again');
        expect(scope.model.showErrorMessage).toBe(true);

    });

    it('should show an error message', function() {
        var msg = 'Test Error Message';

        scope.showErrorMessage(msg);

        expect(scope.model.errorMessage).toEqual(msg);
        expect(scope.model.showErrorMessage).toBe(true);
    });


    it('should send a vote', function() {

        var vote = '8';

        scope.sendVote(vote);

        expect(socket.emit).toHaveBeenCalledWith('vote', vote);
        expect(scope.model.voteSentMessage).toEqual('Your vote ' + vote + ' has been cast. You can still change your vote before voting closes');
        expect(scope.model.showVoteSentMessage).toBe(true);
    });

});