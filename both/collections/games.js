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
            matrix: [
                [{selection: "x", player: "one"}, {}, {}],
                [{}, {selection: "x", player: "one"}, {}],
                [{}, {}, {selection: "x", player: "one"}]
            ],
            chat: {
                show: true,
                conversation: [
                    //{id: 'COMPUTER', name: 'Help', text: 'Chat here...'}
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

    'gameUpdateChatConversation': function(gameId, text) {
        var response = {
            success: false,
            message: 'There was some error. Please try again.'
        };

        // check user signed in
        check(Meteor.userId(), String);

        // validate data
        check(gameId, String);

        var game = Games.findOne(gameId);
        if(game) {
            game.chat.conversation.push({id: Meteor.userId(), name: Meteor.user().profile.name, text: text});

            var result = Games.update(game._id, {$set: {"chat": game.chat}});
            if (result) {
                response.success = true;
                response.message = 'Done.';
            }
        }

        return response;
    },

    'gamePlayerJoined': function(gameId, playerId) {
        var response = {
            success: false,
            message: 'There was some error. Please try again.'
        };

        // check user signed in
        check(Meteor.userId(), String);

        // validate data
        check(gameId, String);

        var game = Games.findOne(gameId);
        if(game) {
            var playerTwo = {
                id: Meteor.userId(),
                    name: Meteor.user().profile.name,
                    image: 'default.png',
                    ready: false,
                    winner: false
            };

            var result = Games.update(game._id, {$set: {"playerTwo": playerTwo, "is.playing": true}});
            if (result) {
                response.success = true;
                response.message = 'Done.';
            }
        }

        return response;
    },

    'gameSelectMatrixCell': function(gameId, cellRow, cellCol, player, selection) {
        var response = {
            success: false,
            message: 'There was some error. Please try again.'
        };

        // check user signed in
        check(Meteor.userId(), String);

        // validate data
        check(gameId, String);

        var game = Games.findOne(gameId);
        if(game) {
            var col = {
                selection: "x",
                player: "one"
            }
            var matrix = [
                [col, col, col],
                [col, col, col],
                [col, col, col]
            ];

            var result = Games.update(game._id, {$set: {matrix: matrix}}, {validate: false});
            console.log(result);
            if (result) {
                response.success = true;
                response.message = 'Done.';
            }
        }

        return response;
    }

});