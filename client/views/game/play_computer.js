// Game Play Computer

// Helper
Template.gamePlayComputer.helpers({

});

// Events
Template.gamePlayComputer.events({
    'click .game-select-level': function(event, template) {
        event.preventDefault();

        var gameType = 'computer';
        var isPublic = false;
        var level = parseInt(template.$(event.currentTarget).attr('level'));
        if(level != 1 || level != 2 || level != 3) {
            level = 1;
        }

        Meteor.call('gamesInsert', gameType, isPublic, level, function (error, response) {
            console.log('gamesInsert');
            console.log(response);

            if(!error) {
                if(response.success) {
                    Router.go('gamePlay', {gameId: response.gameId});
                }
            } else {
                Materialize.toast('There was some error, please try again.', 5000);
            }
        });
    }
});

// On Render
Template.gamePlayComputer.rendered = function() {
    $( function() {
        $('.animate-fade-in').fadeIn();
        Materialize.showStaggeredList('#staggered-test');
    });
};