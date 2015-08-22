// Route Configurations
Router.configure({
    layoutTemplate: 'layoutDefault',
    loadingTemplate: 'commonLoading'
});

Router.plugin('ensureSignedIn', {
    only: ['private']
});

// Pages
    // Home
    Router.route('/', {
        name: 'home',
        template: 'pagesHome'
    });

    Router.route('/private', {
        name: 'private',
        template: 'pagesHome'
    });

AccountsTemplates.configureRoute('signIn');
AccountsTemplates.configureRoute('signUp');