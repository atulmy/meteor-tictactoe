// common functions
Meteor.methods({

    matrixEmpty: function() {
        var matrix = [
            [{}, {}, {}],
            [{}, {}, {}],
            [{}, {}, {}]
        ];
        return matrix;
    },

    isCurrentPlayersTurn: function(game) {
        console.log(game.players[0].id)
        console.log(Meteor.userId());
        if(game.status.turn === 0 && game.players[0].id === Meteor.userId()) {
            return true;
        } else if(game.status.turn === 1 && game.players[1].id === Meteor.userId()) {
            return true;
        }
        return false;
    },

    // HTML5 Browser notifications
    browserNotificationShow: function(message) {
        if('Notification' in window) {
            Notification.requestPermission(function(message) {
                console.log(message);
                var notification = new Notification(
                    "Rock Paper Scissors",
                    {
                        body: message,
                        icon: 'http://localhost:3000/images/favicon.png'
                    }
                );
                setTimeout(function(){
                    notification.close();
                }, 5000);
            });
        }
    }

});