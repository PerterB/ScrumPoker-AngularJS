/**
 * Created by peter on 04/01/2014.
 */

var io = {connect: function(){}};
var App = {};
App.loggedInUsers = [];



describe('ClientController Tests', function() {

    var scope, window, socket, VotingModel;

    var expectReset = function() {
        expect(scope.model.hideVotes).toBe(true);
        expect(scope.model.hideSummary).toBe(true);
        expect(scope.model.votes).toEqual({});
        expect(scope.model.disableReveal).toBe(true);
    };

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
        VotingModel = {}

        $controller('ScrumMasterController', {$scope: scope, $window: window, socket: socket, VotingModel: VotingModel});

    }));

    //TODO: what if no room?
    it('should join the room on connect', function() {

        window.location.pathname = '/some/room';

        scope.onConnect();

        expect(socket.emit).toHaveBeenCalledWith('room', 'room');
    });

    it('should request backlogs from a provider on connect', function() {

        window.location.pathname = '/some/room';

        scope.onConnect();

        expect(socket.emit).toHaveBeenCalledWith('backlogRequest');
    });

    it('should update the list of users when someone logs in', function() {

        scope.model.loggedInUsers = [];

        scope.onLogin('room', 'Peter');

        expect(scope.model.loggedInUsers).toEqual(['Peter']);
    });

    it('should remove the users name from the loggedin list when they log out', function() {

        scope.model.loggedInUsers = ['Peter'];
        scope.onLogout('Peter');

        expect(scope.model.loggedInUsers).toEqual([]);
    });

    it ('should not remove users who are not in the list', function() {
        scope.model.loggedInUsers = ['Peter'];
        scope.onLogout('Paul');

        expect(scope.model.loggedInUsers).toEqual(['Peter']);
    });

    it('should register votes', function() {

        var voteData = {'login': 'Peter', 'vote': '13'};
        scope.model.votes = {};

        scope.onVote(voteData);

        expect(scope.model.votes['Peter']).toEqual('13');
    });

    it('should enable the reveal button after a vote', function() {
        var voteData = {'login': 'Peter', 'vote': '13'};
        scope.model.votes = {};
        scope.model.disableReveal = true;

        scope.onVote(voteData);

        expect(scope.model.disableReveal).toEqual(false);
    });

    it('should receive backlogs from a provider', function() {

        var backlogs = ['B-1234', 'B-4321'];

        scope.onBacklogResponse(backlogs);

        expect(scope.model.preparedBacklogs).toEqual(backlogs);
        expect(scope.model.simpleMode).toEqual(false);
    });

    it('should begin a vote', function() {
        scope.model.backlogNumber = 'B-1234'
        scope.model.defaultVotingOption = {name: 'test', values: [0,1,2,3]};


        scope.beginVote();

        expect(socket.emit).toHaveBeenCalledWith('beginVote', 'B-1234', [0,1,2,3]);


        expect(scope.model.currentBacklog).toEqual('B-1234');
        expectReset();
    });


    it('should reset', function() {

        scope.reset();

        expectReset();
    });


    it('should begin a vote for a given backlog', function() {

        var backlogNumber = 'B-54321';
        scope.model.defaultVotingOption = {name: 'test', values: [0,1,2,3]};

        scope.beginBacklogVote({id: backlogNumber});   //todo: why is this an id property? from provider i guess

        expect(scope.model.currentBacklog).toEqual('B-54321');
        expectReset();

    });

    it('should reveal votes', function() {

        scope.revealVotes();

        expect(socket.emit).toHaveBeenCalledWith('reveal', ['Nobody voted...']);

        expect(scope.model.hideVotes).toBe(false);
        expect(scope.model.hideSummary).toBe(false);
        expect(scope.model.disableReveal).toBe(true);

    });

    it('should save votes', function() {

        scope.model.voteLog = [];
        scope.model.backlogNumber = 'B-1234';
        scope.model.finalVoteValue = '13';


        scope.saveVote();

        expect(socket.emit).toHaveBeenCalledWith('finalVote', {backlogNumber: 'B-1234', finalVote: '13'});

        expect(localStorage['voteLog']).toEqual(JSON.stringify(scope.model.voteLog));

        expectReset();
    });

    it('should clear the log', function() {

        scope.clearLog();

        expect(scope.model.voteLog).toEqual([]);
        expect(localStorage['voteLog']).toEqual('');

    });

    it('should generate stats when nobody votes', function() {

        scope.model.votes = {};

        scope.generateVoteStats();

        expect(scope.model.summaryText).toEqual(['Nobody voted...']);

    });

    it('should generate stats when one person votes', function() {

        scope.model.votes = {'Peter': '13'};

        scope.generateVoteStats();

        expect(scope.model.summaryText).toEqual(['1 person voted: 13']);
    });

    it('should generate stats when two people have the same vote', function() {

        scope.model.votes = {'Peter': '13', 'Perter': '13'};

        scope.generateVoteStats();

        expect(scope.model.summaryText).toEqual(['2 people voted: 13']);
    });

    it('should generate stats when two people have different votes', function() {

        scope.model.votes = {'Peter': '13', 'Perter': '8'};

        scope.generateVoteStats();

        expect(scope.model.summaryText).toEqual(['1 person voted: 8', '1 person voted: 13']);
    });
});