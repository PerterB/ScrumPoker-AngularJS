/**
 * Created by peter on 02/01/2014.
 */
PlanningApp.app.factory('VotingModel', function() {

    return {
        loggedInUsers: [],

        currentBacklog: '',

        finalVoteValue: '',

        voteLog: JSON.parse(localStorage['voteLog'] || '[]'),

        votes: {},

        disableReveal: true,

        hideVotes: true,

        hideSummary: true,

        preparedBacklogs: [],

        simpleMode:true,

        summaryText: [],

        /**
         * List of possible voting options
         */
        votingOptions: [
            {name: 'Standard', values: [1, 2, 3, 5, 8, 13, 20, 40, 100, '?']},
            {name: 'T-Shirt', values: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '?']},
            {name: 'Fibonacci', values: [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, '?']}
        ],

        defaultVotingOption: {name: 'Standard', values: [1, 2, 3, 5, 8, 13, 20, 40, 100, '?']}
    }
});