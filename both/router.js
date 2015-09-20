// Route Configurations
Router.configure({
    layoutTemplate: 'layoutDefault',
    loadingTemplate: 'commonLoading'
});

// Login / Signup
AccountsTemplates.configureRoute('signIn');
AccountsTemplates.configureRoute('signUp');
Router.plugin('ensureSignedIn', {
    except: ['home', 'about']
    //only: ['about']
});

// Global Variables
var interval;

// Pages
    // Home
    Router.route('/', {
        name: 'home',
        template: 'pagesHome'
    });

    // About
    Router.route('/about', {
        name: 'about',
        template: 'pagesAbout'
    });

// Game
    // Play with Friend
    Router.route('/play/friend', {
        name: 'gamePlayFriend',
        template: 'gamePlayFriend',
        waitOn: function() {
            return Meteor.subscribe('gamesOnline')
        }
    });

    // Play with Computer
    Router.route('/play/computer', {
        name: 'gamePlayComputer',
        template: 'gamePlayComputer'
    });

    // Play Game
    Router.route('/play/:gameId', {
        name: 'gamePlay',
        template: 'gamePlay',
        waitOn: function() {
            return Meteor.subscribe('game', this.params.gameId);
        },
        onBeforeAction: function() {
            Session.set('gameId', this.params.gameId);
            this.next();
        },
        onStop: function() {
            // End the game
            var game = Games.findOne({_id: Session.get('gameId')});
            Meteor.call('gameFinish', game._id, function(error, response) {
                console.log('gameFinish');
            });

            // Clear game id in session
            Session.set('gameId', '');

            // Clear in game message interval
            if(typeof interval != 'undefined') {
                try {
                    interval.clearInterval();
                }
                catch(err) {

                }
            }
        }
    });