// Route Configurations
Router.configure({
    layoutTemplate: 'layoutDefault',
    loadingTemplate: 'commonLoading'
});

// Login / Signup
AccountsTemplates.configureRoute('signIn');
AccountsTemplates.configureRoute('signUp');
Router.plugin('ensureSignedIn', {
    only: ['gamePlayFriend', 'gamePlayComputer']
});

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
        },
        onBeforeAction: function() {
            var onlineGamesCountDb = Games.find({}, {sort: {createdAt: -1}}).count();
            Session.set('onlineGamesCount', onlineGamesCountDb);
            this.next();
        },
    });

    // Play with Computer
    Router.route('/play/computer', {
        name: 'gamePlayComputer',
        template: 'gamePlayComputer'
    });

    // Play with Computer
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
            Session.set('gameId', '');
        }
    });