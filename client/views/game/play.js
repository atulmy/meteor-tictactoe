// Game Play

// Helper
Template.gamePlay.helpers({
    currentUrl: function(){
        return window.location.protocol+'://'+window.location.host+'/play/'+Session.get('gameId');
    },

    game: function() {
        return Games.findOne({_id: Session.get('gameId')});
    },
});

// Events
Template.gamePlay.events({

});

// On Render
Template.gamePlay.rendered = function() {
    var game = Games.findOne({_id: Session.get('gameId')});
    if(game) {

    }

    $( function() {
        $('.animate-fade-in').fadeIn();

        // Resize Cell Height
        $('.cell').height($('.cell').width() + 15);

        // Tabs
        $('ul.tabs').tabs();
    });
};