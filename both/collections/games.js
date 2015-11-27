Games = new Mongo.Collection('games');

Meteor.methods({

    'gamesInsert': function(gameType, isPublic, level) {
        console.log(gameType+' '+isPublic+' '+level);
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
        var computer = {
            selected: false,
            level: 0
        };
        if(gameType === 'computer') {
            if(typeof level === 'undefined') {
                level = 1; // easy = 1, medium = 2, hard = 3
            }
            computer.selected = true;
            computer.level = parseInt(level);
        }

        // create game document
        var matrix = JSON.stringify(Meteor.call('matrixEmpty'));
        var playerOne = {
            id: Meteor.userId(),
            name: Meteor.user().profile.name,
            image: Meteor.user().profile.picture,
            ready: false,
            score: 0,
            winner: false
        };
        var game = {
            players: [playerOne],

            computer: computer,

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

    'gameUpdateChatConversation': function(gameId, text, isComputer) {
        var response = {
            success: false,
            message: 'There was some error. Please try again.'
        };

        // check user signed in
        check(Meteor.userId(), String);

        // validate data
        check(gameId, String);

        if(typeof isComputer == 'undefined') {
            isComputer = false;
        }

        var game = Games.findOne(gameId);
        if(game) {
            if(isComputer) {
                var conversation = {
                    id: 'COMPUTER',
                    userKey: 1,
                    name: 'Computer',
                    text: text
                };
            } else {
                var userKey = 0;
                if (game.players[1].id === Meteor.userId()) {
                    userKey = 1;
                }
                conversation = {
                    id: Meteor.userId(),
                    userKey: userKey,
                    name: Meteor.user().profile.name,
                    text: text
                };
            }

            game.chat.conversation.push(conversation);

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
                image: Meteor.user().profile.picture,
                ready: false,
                score: 0,
                winner: false
            };
            if(game.computer.selected) {
                playerTwo.id = 'COMPUTER';
                playerTwo.name = 'Computer';
                playerTwo.image = '/images/computer.jpg';
            }
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
            setFinished: false,
            won: false
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
                response.won = won;

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

    'gameSetFinished': function(gameId, won) {
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

            var players = game.players;
            if(won) {
                var winnerKey = (game.status.turn === 1) ? 0 : 1;
                sets[(sets.length - 1)].result = {
                    winner: game.players[winnerKey].name,
                    using: sets[(sets.length - 1)].piece[winnerKey]
                };
                players[winnerKey].score = players[winnerKey].score + 1;
            } else {
                sets[(sets.length - 1)].result = {
                    winner: 'Draw',
                    using: '--'
                };
            }

            if(players[0].score === players[1].score) {
                players[0].winner = false;
                players[1].winner = false;
            } else if(players[0].score > players[1].score) {
                players[0].winner = true;
                players[1].winner = false;
            } else {
                players[1].winner = true;
                players[0].winner = false;
            }

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

            var result = Games.update(game._id, {$set: {sets: sets, players: players}});
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
    },

    'gameFinish': function(gameId) {
        var response = {
            success: false,
            message: 'There was some error. Please try again.'
        };

        var game = Games.findOne(gameId);
        if(game) {
            var result = Games.update(game._id, {$set: {"is.completed": true, "is.playing": false}});
            if (result) {
                response.success = true;
                response.message = 'Done.';
            }
        }

        return response;
    },

    'gameComputersTurn': function(gameId) {
        var response = {
            success: false,
            message: 'There was some error. Please try again.',
            setFinished: false
        };

        if(Meteor.isServer) {
            var game = Games.findOne(gameId);
            if(game) {
                var currentSet = game.sets[(game.sets.length - 1)];
                var matrixJSON = JSON.parse(currentSet.matrix);
                console.log(matrixJSON);

                // Which piece
                var player = 1;
                var selection = currentSet.piece[player];
                var xmin  = 0;
                var xmax  = 2;
                var row = Math.floor( Math.random() * (xmax + 1 - xmin) + xmin );
                var col = Math.floor( Math.random() * (xmax + 1 - xmin) + xmin );
                matrixJSON[row][col] = {
                    selection: selection,
                    player: player
                };

                game.sets[(game.sets.length - 1)].matrix = JSON.stringify(matrixJSON);

                var nextTurn = (game.status.turn === 0) ? 1 : 0;

                var result = Games.update(game._id, {$set: {sets: game.sets, "status.turn": nextTurn}});
                if (result) {
                    response.success = true;
                    response.message = 'Done.';
                }
            }
        }

        return response;
    }

});