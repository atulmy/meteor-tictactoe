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
                piece: ['x', 'o'],
                number: 1,
                matrix: matrix,
                highlightCells: JSON.stringify([])
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

    'gameSelectMatrixCell': function(gameId, cellRow, cellCol) {
        var response = {
            success: false,
            message: 'There was some error. Please try again.',
            setFinished: false
        };

        // check user signed in
        check(Meteor.userId(), String);

        // validate data
        check(gameId, String);

        var game = Games.findOne(gameId);
        if(game) {
            var currentSet = game.sets[(game.sets.length - 1)];

            var matrixJSON = JSON.parse(currentSet.matrix);

            if(typeof matrixJSON[cellRow][cellCol].selection === 'undefined') {

                // Which piece
                if (game.players[0].id === Meteor.userId()) {
                    var player = 0;
                    var selection = currentSet.piece[0];
                } else if (game.players[1].id === Meteor.userId()) {
                    player = 1;
                    selection = currentSet.piece[1];
                }

                matrixJSON[cellRow][cellCol] = {
                    selection: selection,
                    player: player
                };

                // check for winner
                // horizontal possibilities
                var won = false;
                var highlightCells = [];
                for(var i = 0; i <= 2; i++) {
                    if(!won) {
                        highlightCells = [];
                        var thisRow = true;
                        for (var j = 0; j <= 2; j++) {
                            if (matrixJSON[i][j].selection != selection) {
                                thisRow = false;
                            } else {
                                highlightCells.push({'r': i, 'c': j});
                            }
                        }
                        if (thisRow) {
                            won = true;
                        }
                    }
                }
                console.log('horizontal '+won);
                if(!won) {
                    // vertical possibilities
                    for(var i = 0; i <= 2; i++) {
                        if(!won) {
                            highlightCells = [];
                            var thisCol = true;
                            for (var j = 0; j <= 2; j++) {
                                if (matrixJSON[j][i].selection != selection) {
                                    thisCol = false;
                                } else {
                                    highlightCells.push({'r': j, 'c': i});
                                }
                            }
                            if (thisCol) {
                                won = true;
                            }
                        }
                    }
                    console.log('vertical '+won);
                    if(!won) {
                        // diagonal possibilities: \
                        highlightCells = [];
                        var thisDiagonal = true;
                        for(var i = 0; i <= 2; i++) {
                            if(matrixJSON[i][i].selection != selection) {
                                thisDiagonal = false;
                            } else {
                                highlightCells.push({'r': i, 'c': i});
                            }
                        }
                        if(thisDiagonal) {
                            won = true;
                        }
                        console.log('diagonal \\ '+won);
                        if(!won) {
                            // diagonal possibilities: /
                            highlightCells = [];
                            var thisDiagonal = true;
                            var j = 2;
                            for(var i = 0; i <= 2; i++) {
                                if(matrixJSON[i][j].selection != selection) {
                                    thisDiagonal = false;
                                } else {
                                    highlightCells.push({'r': i, 'c': j});
                                }
                                j--;
                            }
                            if(thisDiagonal) {
                                won = true;
                            }
                            console.log('diagonal / '+won);
                        }
                    }
                }
                console.log('won '+won);
                console.log('highlightCells');
                console.log(highlightCells);

                // check if all cells are filled
                var completed = true;
                if(!won) {
                    highlightCells = [];
                    matrixJSON.forEach(function (rowData, rowKey) {
                        rowData.forEach(function (colData, colKey) {
                            if (_.isEmpty(colData)) {
                                completed = false;
                            }
                        });
                    });
                }

                game.sets[(game.sets.length - 1)].matrix = JSON.stringify(matrixJSON);
                game.sets[(game.sets.length - 1)].highlightCells = JSON.stringify(highlightCells);

                var nextTurn = (game.status.turn === 0) ? 1 : 0;

                var result = Games.update(game._id, {$set: {sets: game.sets, "status.turn": nextTurn}});
                if (result) {
                    response.success = true;
                    response.message = 'Done.';
                }

                if (completed) {
                    response.setFinished = true;
                }
            }
        }

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
            // Add new set
            var sets = game.sets;

            // Set winner
            var winnerKey = (game.status.turn === 1) ? 0 : 1;
            sets[(sets.length - 1)].result = {
                winner: game.players[winnerKey].name,
                using: sets[(sets.length - 1)].piece[winnerKey]
            };

            var piece = (game.status.turn === 1) ? ['o', 'x'] : ['x', 'o'];

            // Create new set
            var matrix = JSON.stringify(Meteor.call('matrixEmpty'));
            var set = {
                piece: piece,
                number: (sets.length + 1),
                matrix: matrix,
                highlightCells: JSON.stringify([])
            };
            sets.push(set);

            var result = Games.update(game._id, {$set: {sets: sets}});
            if (result) {
                response.success = true;
                response.message = 'Done.';
            }
        }

        return response;
    },

    'gameRestartCurrentSet': function(gameId) {
        var response = {
            success: false,
            message: 'There was some error. Please try again.',
            setFinished: false
        };

        var game = Games.findOne(gameId);
        if(game) {
            var sets = game.sets;

            sets[(sets.length - 1)].matrix = JSON.stringify(Meteor.call('matrixEmpty'));
            sets[(sets.length - 1)].highlightCells = JSON.stringify([]);

            Meteor.call('nextSetPlayerKey', sets, function(error, turn) {
                if(!error) {
                    var result = Games.update(game._id, {$set: {sets: sets, "status.turn": turn}});
                    if (result) {
                        response.success = true;
                        response.message = 'Done.';
                    }
                }
            });
        }

        return response;
    }

});