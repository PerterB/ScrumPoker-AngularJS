/**
 * Created by peter on 04/01/2014.
 */

var io = {connect: function(){}};
var App = {};
App.loggedInUsers = [];



describe('VotersController Tests', function() {

    var scope, window, socket, VotingModel;

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
            on: jasmine.createSpy()
        };
        VotingModel = {}

        $controller('VotersController', {$scope: scope, $window: window, socket: socket, VotingModel: VotingModel});

    }));

    it('should register when a user votes', function() {

        var voteData = {login: 'Peter', vote: '13'};
        scope.model.votes = {};

        scope.onVote(voteData);

        expect(scope.model.votes['Peter']).toEqual('13');
    });

    it('should reset the user icons when a vote begins', function() {
        scope.model.hideVotes = false;
        scope.model.votes = "non null value";

        scope.onBeginVote();

        expect(scope.model.hideVotes).toEqual(true);
        expect(scope.model.votes).toEqual({});
    });

    it('should reveal votes', function() {

        scope.onReveal();

        expect(scope.model.hideVotes).toBe(false);

    });

    it('should not display the current user in the list', function() {

        scope.$parent = {
            model: {
                username: 'Peter'
            }
        };

        var filter = scope.filterCurrentUser('Peter');

        expect(filter).toBe(false);
    });

    it('should display other users in the list', function() {

        scope.$parent = {
            model: {
                username: 'Peter'
            }
        };

        var filter = scope.filterCurrentUser('Paul');

        expect(filter).toBe(true);
    });
});