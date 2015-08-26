// Game Play Computer

// Helper
Template.gamePlayComputer.helpers({

});

// Events
Template.gamePlayComputer.events({

});

// On Render
Template.gamePlayComputer.rendered = function() {
    $( function() {
        $('.animate-fade-in').fadeIn();
        Materialize.showStaggeredList('#staggered-test');
    });
};