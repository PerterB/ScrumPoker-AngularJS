/**
 * Created by peter on 04/01/2014.
 */

var io = {connect: function(){}};
var App = {};
App.loggedInUsers = [];



describe('ScrumMasterController Tests', function() {

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
            $on: jasmine.createSpy(),
            $watch: jasmine.createSpy()
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

    it('should assign the loggedIn users', function() {

        scope.model.loggedInUsers = [];

        scope.init(['Peter']);

        expect(scope.model.loggedInUsers).toEqual(['Peter']);

    });

    it('should join the room on connect', function() {

        window.location.pathname = '/some/room';

        scope.onConnect();

        expect(socket.emit).toHaveBeenCalledWith('room', 'room');
    });

    it('should request scopes from a provider on connect', function() {

        window.location.pathname = '/some/room';

        scope.onConnect();

        expect(socket.emit).toHaveBeenCalledWith('scopesRequest');
    });

    it('should request a list of statuses on connect', function() {

        window.location.pathname = '/some/room';

        scope.onConnect();

        expect(socket.emit).toHaveBeenCalledWith('statusRequest');
    });

    it('should update the list of users when someone logs in', function() {

        scope.model.loggedInUsers = [];

        scope.onLogin('Peter');

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

    it('should enable the reveal button after a vote', function() {

        scope.model.disableReveal = true;

        scope.onVote();

        expect(scope.model.disableReveal).toEqual(false);
    });

    it('should receive backlogs from a provider', function() {

        var backlogs = ['B-1234', 'B-4321'];

        scope.onBacklogResponse(backlogs);

        expect(scope.model.preparedBacklogs).toEqual(backlogs);
        expect(scope.model.simpleMode).toEqual(false);
    });

    it('should receive scopes from a provider', function() {
        var scopes = [{
            scopeId: 12345,
            name: 'Trunk'
        }, {
            scopeId: 54321,
            name: 'Branch'
        }];

        scope.onScopesResponse(scopes);

        expect(scope.model.scopes).toEqual(scopes);
        expect(scope.model.simpleMode).toBe(false);
    });

    it('should watch the current scope after receiving scopes from a provider', function() {
        var scopes = [{
            scopeId: 12345,
            name: 'Trunk'
        }, {
            scopeId: 54321,
            name: 'Branch'
        }];

        scope.onScopesResponse(scopes);

        expect(scope.$watch).toHaveBeenCalled();
    });

    it('should request backlogs after the scope changes', function() {
        var scopes = [{
            scopeId: 12345,
            name: 'Trunk'
        }, {
            scopeId: 54321,
            name: 'Branch'
        }];

        scope.model = {
            currentScope: 'currentScope'
        };
        scope.onScopesResponse(scopes);

        expect(scope.$watch).toHaveBeenCalled();
        expect(scope.$watch.mostRecentCall.args[0]).toEqual('model.currentScope');

        var watchFn = scope.$watch.mostRecentCall.args[1];
        watchFn('test');

        expect(socket.emit).toHaveBeenCalledWith('backlogRequest', 'currentScope');
    });

    it('should not request backlogs if the scope does not change', function() {
        var scopes = [{
            scopeId: 12345,
            name: 'Trunk'
        }, {
            scopeId: 54321,
            name: 'Branch'
        }];

        scope.model = {
            currentScope: 'currentScope'
        };
        scope.onScopesResponse(scopes);

        expect(scope.$watch).toHaveBeenCalled();
        expect(scope.$watch.mostRecentCall.args[0]).toEqual('model.currentScope');

        var watchFn = scope.$watch.mostRecentCall.args[1];
        watchFn()

        expect(socket.emit).not.toHaveBeenCalledWith('backlogRequest', 'currentScope');
    });

    it('should receive statuses from the provider', function() {

        var expectedStatus = {status:123};
        scope.model.statuses = undefined;

        scope.onStatusResponse(expectedStatus);

        expect(scope.model.statuses).toEqual(expectedStatus);

    });

    it('should not overwrite null statuses from the provider', function() {

        scope.model.statuses = undefined;

        scope.onStatusResponse(null);

        expect(scope.model.statuses).toBeFalsy();

    });

    it('should remove backlogs from the list when a status is successfully changed', function() {

        scope.model.preparedBacklogs = [{assetId:123}, {assetId:456}];

        scope.onChangeStatusResponse({success:true, backlogId:123});

        expect(scope.model.preparedBacklogs).toEqual([{assetId:456}]);

    });

    it('should set and error message when a status is not successfully changed', function() {

        scope.model.preparedBacklogs = [{assetId:123, title: 'Test'}];

        scope.onChangeStatusResponse({success:false, backlogId:123});

        expect(scope.model.preparedBacklogs[0].title).toEqual('Test<div class="alert alert-warning">An error occurred changing the status of this backlog</div>');

    });

    it ('should display an error if a backlog is not successfully updated after the final vote', function() {

        scope.model.preparedBacklogs = [{assetId:123, title: 'Test'}];

        scope.onBacklogReadyResponse({success:false, backlogId:123});

        expect(scope.model.preparedBacklogs[0].title).toEqual('Test<div class="alert alert-warning">An error occurred updating this backlog</div>');

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

        scope.beginBacklogVote({id: backlogNumber});

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

    it('should set the final voteValue on the current backlog if there are prepared backlogs', function() {

        var preparedBacklogs = [{
            assetId: 'Asset:12345',
            id: 'B-12345',
            title: 'First'
        }];

        scope.model.preparedBacklogs = preparedBacklogs;
        scope.model.voteLog = [];
        scope.model.backlogNumber = 'B-12345';
        scope.model.finalVoteValue = '13';

        scope.saveVote();

        //expect(socket.emit).toHaveBeenCalledWith('backlogReadyRequest', {backlogNumber: 'B-12345', finalVote: '13', status: 'Sprint Ready'});

        expect(scope.model.preparedBacklogs[0].finalVoteValue).toEqual('13');

    });

    it('should only set the final voteValue on the current backlog if there are prepared backlogs', function() {

        var preparedBacklogs = [{
            id: 'B-12345',
            assetId: 'Asset:12345',
            title: 'First'
        }, {
            id: 'B-54321',
            assetId:'Asset:54321',
            title: 'Second'
        }];

        scope.model.preparedBacklogs = preparedBacklogs;
        scope.model.voteLog = [];
        scope.model.backlogNumber = 'B-12345';
        scope.model.finalVoteValue = '13';

        scope.saveVote();

        expect(scope.model.preparedBacklogs[0].finalVoteValue).toEqual('13');
        expect(scope.model.preparedBacklogs[1].finalVoteValue).toBeUndefined();

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