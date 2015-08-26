Games = new Mongo.Collection('games');

Meteor.methods({

    'gamesInsert': function(gameType, isPublic, byUserName) {
        var response = {
            success: false,
            message: 'There was some error. Please try again.',
            gameId: ''
        };

        // check user signed in
        check(Meteor.userId(), String);

        // validate data
        check(isPublic, Boolean);

        // check for AI
        var ai = false;
        if(gameType === 'computer') {
            ai = true;
        }

        // create game document
        var game = {
            playerOne: {
                id: Meteor.userId(),
                name: Meteor.user().profile.name,
                image: 'default.png',
                ready: false,
                winner: false
            },
            ai: ai,
            chat: {
                show: true,
                conversation: [
                    {id: 'COMPUTER', name: 'Help', text: 'Chat here...'}
                ]
            },
            is: {
                playing: false,
                completed: false,
                isPublic: isPublic
            }
        };

        var gameId = Games.insert(game);
        if(gameId) {
            response.success = true;
            response.message = 'Game has been added successfully.';
            response.gameId = gameId;
        }

        return response;
    },

    'gamesDelete': function(thoughtId) {
        var response = {
            success: false,
            message: 'There was some error. Please try again.'
        };

        // check user signed in
        check(Meteor.userId(), String);

        // validate data
        check(thoughtId, String);

        var thought = Thoughts.findOne(thoughtId)
        if(thought.by.id === Meteor.userId()) {
            var thoughtUpdateCheck = Thoughts.remove(thoughtId);
            if(thoughtUpdateCheck) {
                response.success = true;
                response.message = 'Thought has been deleted successfully.';
            }
        } else {
            response.message = 'You are not allowed to perform this action.';
        }

        return response;
    }

});