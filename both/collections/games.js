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
        var matrix = JSON.stringify(Meteor.call('matrixEmpty'));
        var playerOne = {
            id: Meteor.userId(),
            name: Meteor.user().profile.name,
            image: 'default.png',
            ready: false,
            score: 0,
            winner: false
        };
        var game = {
            players: [playerOne],

            ai: ai,

            sets: [{
                number: 1,
                matrix: matrix
            }],

            chat: {
                show: true,
                conversation: []
            },

            status: {
                playerJoined: false,
                turn: 0
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
                score: 0,
                winner: false
            };
            game.players.push(playerTwo);

            console.log(game.players);

            var result = Games.update(game._id, {$set: {
                players: game.players,
                "is.playing": true,
                "status.playerJoined": true
            }});

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
            var matrixJSON = JSON.parse(game.sets[(game.sets.length - 1)].matrix);
            console.log(matrixJSON);
            matrixJSON[cellRow][cellCol] = {
                selection: "x",
                player: game.status.turn
            };
            game.sets[(game.sets.length - 1)].matrix = JSON.stringify(matrixJSON);

            var nextTurn = (game.status.turn === 0) ? 1 : 0;

            var result = Games.update(game._id, {$set: {sets: game.sets, "status.turn": nextTurn}});
            if (result) {
                response.success = true;
                response.message = 'Done.';
            }
        }

        //response.setFinished = true; // @temp

        return response;
    },

    'gameSetFinished': function(gameId) {
        var response = {
            success: false,
            message: 'There was some error. Please try again.',
            setFinished: false
        };

        var game = Games.findOne(gameId);
        if(game) {
            var sets = game.sets;

            // Set winner
            sets[(sets.length - 1)].result = {
                winner: 'Atul Yadav',
                using: 'X'
            };

            // Create new set
            var matrix = JSON.stringify(Meteor.call('matrixEmpty'));
            var set = {
                number: (sets.length + 1),
                matrix: matrix
            };
            sets.push(set);

            console.log(sets);

            var result = Games.update(game._id, {$set: {sets: sets}});
            if (result) {
                response.success = true;
                response.message = 'Done.';
            }
        }

        return response;
    }

});