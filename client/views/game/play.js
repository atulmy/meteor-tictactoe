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
        var game = Games.findOne({_id: Session.get('gameId')});
        return game.chat.conversation.reverse();
    },

    gameSets: function() {
        var game = Games.findOne({_id: Session.get('gameId')});
        return game.sets.reverse();
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

            Meteor.call('gameUpdateChatConversation', game._id, text, function (error, response) {
                console.log('gameUpdateChatConversation');
                console.log(response);

                if (!error) {
                    template.$('#form-game-chat-text').val('');
                } else {
                    Materialize.toast('There was some error, please try again.', 5000);
                }

                template.$('#form-game-chat-send').removeAttr('disabled');
            });
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

                        var player = 'one';
                        var selection = 'x';

                        Meteor.call('gameSelectMatrixCell', game._id, cellRow, cellCol, player, selection, function (error, response) {
                            console.log('gameSelectMatrixCell');
                            console.log(response);

                            if (!error) {
                                if (response.success && response.setFinished) {
                                    Meteor.call('gameSetFinished', game._id, function (error, response) {
                                        console.log('gameSetFinished');
                                        console.log(response);
                                    });
                                }
                            } else {
                                Materialize.toast('There was some error, please try again.', 5000);
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
                    Materialize.toast('There was some error, please try again.', 5000);
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
    });
};