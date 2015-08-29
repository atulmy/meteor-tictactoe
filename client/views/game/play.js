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
                    alert('There was some error, please try again.');
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
            var cellRow = template.$(event.currentTarget).attr('cell-row');
            var cellCol = template.$(event.currentTarget).attr('cell-col');
            console.log(cellRow + ' ' + cellCol);

            var player = 'one';
            var selection = 'x';

            Meteor.call('gameSelectMatrixCell', game._id, cellRow, cellCol, player, selection, function (error, response) {
                console.log('gameSelectMatrixCell');
                console.log(response);
            });
        }
    }

});

// On Render
Template.gamePlay.rendered = function() {
    console.log('gamePlay.rendered');

    var game = Games.findOne({_id: Session.get('gameId')});
    if(game) {
        // Set second player
        if(typeof game.playerTwo === 'undefined' && game.playerOne.id !== Meteor.userId()) {
            Meteor.call('gamePlayerJoined', game._id, function(error, response) {
                console.log('gamePlayerJoined');
                console.log(response);
            });
        }

        game.matrix.forEach(function(cols, row){
            //console.log('row '+row);
            cols.forEach(function(data, col){
                //console.log('col '+col);
                //console.log(data);

                if(typeof data.selection !== 'undefined') {
                    if(data.selection === 'x') {
                        $('#matrix .cell-'+row+'-'+col).html('<i class="material-icons large">close</i>');
                    } else {
                        $('#matrix .cell-'+row+'-'+col).html('<i class="material-icons large">radio_button_unchecked</i>');
                    }
                }
            });
        });
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