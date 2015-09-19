// Game Play

// Helper
Template.gamePlay.helpers({
    currentUrl: function(){
        return window.location.protocol+'://'+window.location.host+'/play/'+Session.get('gameId');
    },

    game: function() {
        return Games.findOne({_id: Session.get('gameId')});
    },

    gameChat: function() {
        var chatConversation = [];
        var game = Games.findOne({_id: Session.get('gameId')});
        if(game) {
            chatConversation = game.chat.conversation.reverse()
        }
        return chatConversation;
    },

    gameSets: function() {
        var sets = [];
        var game = Games.findOne({_id: Session.get('gameId')});
        if(game) {
            sets = game.sets.reverse();
        }
        return sets;
    },

    gameHighlightCells: function() {
        var highlightCells = {};
        var game = Games.findOne({_id: Session.get('gameId')});
        if(game) {
            var highlightCells = game.sets[(game.sets.length - 1)].highlightCells;
            if(highlightCells.length > 0) {
                highlightCells = JSON.parse(highlightCells);
                highlightCells.forEach(function (rowData) {
                    $('.cell-' + rowData.r + rowData.c).find('i').addClass('pulse');
                });
            }
            highlightCells = game.sets[(game.sets.length - 1)].highlightCells;
        }
        return highlightCells;
    },

    getCellData: function(row, col) {
        var game = Games.findOne({_id: Session.get('gameId')});
        if(game) {
            var matrix = JSON.parse(game.sets[(game.sets.length - 1)].matrix);
            if(matrix[row][col] !== 'undefined') {
                if(matrix[row][col].selection === 'x') {
                    return '<i class="material-icons large">close</i>';
                } else if(matrix[row][col].selection === 'o') {
                    return '<i class="material-icons large">radio_button_unchecked</i>';
                }
            }
        }
        return "&nbsp;";
    },

    gamePlayerName: function(player) {
        var playerName = 'Player';
        var game = Games.findOne({_id: Session.get('gameId')});
        if(game) {
            if(player === 0) {
                playerName = game.players[0].name;
            } else if(player === 1) {
                playerName = (typeof game.players[1] !== 'undefined') ? game.players[1].name : '(Waiting for player...)';
            }
        }
        return playerName;
    }
});

// Events
Template.gamePlay.events({

    // Chat submit
    'submit #form-game-chat': function(event, template) {
        event.preventDefault();

        console.log('submit #form-game-chat');

        var game = Games.findOne({_id: Session.get('gameId')});
        if (game) {
            template.$('#form-game-chat-send').attr('disabled', 'disabled');

            var text = template.$('#form-game-chat-text').val();

            if(text.length > 0) {

                Meteor.call('gameUpdateChatConversation', game._id, text, function (error, response) {
                    console.log('gameUpdateChatConversation');
                    console.log(response);

                    if (!error) {
                        template.$('#form-game-chat-text').val('');
                    } else {
                        Meteor.call('errorServer');
                    }

                    template.$('#form-game-chat-send').removeAttr('disabled');
                });
            } else {
                Materialize.toast('You did not enter any text.', 5000);
                template.$('#form-game-chat-send').removeAttr('disabled');
            }
        }
    },

    'click #restart-set-okay': function(event, template) {
        event.preventDefault();

        console.log('click #restart-set-okay');

        var game = Games.findOne({_id: Session.get('gameId')});
        if (game) {
            if (game.is.playing) {
                Meteor.call('gameRestartCurrentSet', game._id, function(error, response) {
                    console.log('gameRestartCurrentSet');

                    if (!error) {
                        if(response.success) {
                            $('#modal-restart-set').closeModal();
                            Materialize.toast('Current game set has been reset.', 5000);
                        } else {
                            Meteor.call('errorServer');
                        }
                    } else {
                        Meteor.call('errorServer');
                    }
                });
            }
        }
    },

    // Matrix cell click
    'click #matrix .cell': function(event, template) {
        event.preventDefault();

        console.log('click #matrix .cell');

        var game = Games.findOne({_id: Session.get('gameId')});
        if (game) {
            if(game.is.playing) {
                Meteor.call('isCurrentPlayersTurn', game, function(error, response) {
                    if(response) {
                        var cellRow = parseInt(template.$(event.currentTarget).attr('cell-row'));
                        var cellCol = parseInt(template.$(event.currentTarget).attr('cell-col'));
                        console.log(cellRow + ' ' + cellCol);

                        Meteor.call('gameSelectMatrixCell', game._id, cellRow, cellCol, function (error, response) {
                            console.log('gameSelectMatrixCell');
                            console.log(response);

                            if (!error) {
                                if (response.success && response.setFinished) {
                                    Meteor.setTimeout(function() {
                                        Meteor.call('gameSetFinished', game._id, function (error, response) {
                                            console.log('gameSetFinished');
                                            console.log(response);
                                        });
                                    }, 3000);
                                }
                            } else {
                                Meteor.call('errorServer');
                            }
                        });
                    } else {
                        Materialize.toast('Its not your turn yet.', 3000);
                    }
                });
            } else {
                Materialize.toast('The game has not started yet.', 3000);
            }
        }
    }

});

// On Render
Template.gamePlay.rendered = function() {
    console.log('gamePlay.rendered');

    var game = Games.findOne({_id: Session.get('gameId')});
    if(game) {
        // Set second player
        if(typeof game.players[1] === 'undefined' && game.players[0].id !== Meteor.userId()) {
            Meteor.call('gamePlayerJoined', game._id, function(error, response) {
                console.log('gamePlayerJoined');
                console.log(response);

                if(!error) {

                } else {
                    Meteor.call('errorServer');
                }
            });
        }

        /*
        game.matrix.forEach(function(data, key){
            //console.log('row '+row);

            if(data !== null && typeof data.selection !== 'undefined') {
                if(data.selection === 'x') {
                    $('#matrix .cell-'+key).html('<i class="material-icons large">close</i>');
                } else {
                    $('#matrix .cell-'+key).html('<i class="material-icons large">radio_button_unchecked</i>');
                }
            }
        });
        */
    } else {
        Router.go('home');
    }

    $( function() {
        $('.animate-fade-in').fadeIn();
        //$('#form-game-chat-text').focus();

        // Resize Cell Height
        $('.cell').height($('.cell').width() + 15);

        // Tabs
        $('ul.tabs').tabs();

        // Modal
        $('.modal-trigger').leanModal();

        var i = 0;
        interval = setInterval(function() {
            if($('.player-turn-message').length) {
                console.log('in');
                if (i === 0) {
                    $('.player-versus-message').hide();
                    $('.player-turn-message').fadeIn();
                    i = 1;
                    console.log(1);
                } else {
                    $('.player-turn-message').hide();
                    $('.player-versus-message').fadeIn();
                    i = 0;
                    console.log(0);
                }
            }
        }, 5000);
    });
};