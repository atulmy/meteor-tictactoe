// Game Play Friend

// Helper
Template.gamePlayFriend.helpers({
    gamesOnline: function() {
        return Games.find({}, {sort: {createdAt: -1}});
    },

    gamesOnlineCount: function() {
        return Games.find({}, {sort: {createdAt: -1}}).count();
    }
});

// Events
Template.gamePlayFriend.events({

    'click #game-start': function(event, template) {
        event.preventDefault();

        var gameType = 'friend';
        var isPublic = true;

        Meteor.call('gamesInsert', gameType, isPublic, 0, function (error, response) {
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

Template.gamePlayFriend.rendered = function() {
    $( function() {
        $('.animate-fade-in').fadeIn();
        Materialize.showStaggeredList('.staggered-list');
        $('#staggered-list').removeClass('staggered-list');
    });


    /*
    Tracker.autorun(function () {
        Games.find({"is.isPublic": true}).observe({
            changed: function(newDocument, oldDocument) {
                Materialize.showStaggeredList('#staggered-test');
                console.log("a");
            }
        });
    });
    */
};