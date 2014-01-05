/**
 * Created by peter on 03/01/2014.
 */
PlanningApp.app.factory('ClientModel', function() {

    return {

        loggedInUsers: App.loggedInUsers,

        loggedIn: false,

        username: undefined,

        votingOpen: false,

        errorMessage: '',

        showErrorMessage: false,

        statusMessage: '',

        showStatusMessage: false,

        voteSentMessage: '',

        showVoteSentMessage: false,

        showVoteLog: false,

        voteLog: [],

        showSummary: false,

        summaryText: []
    };
});