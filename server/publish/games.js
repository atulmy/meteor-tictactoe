// Publish Games collection to client

// Online Games
Meteor.publish('gamesOnline', function() {
    return Games.find({"is.isPublic": true}, {sort: {createdAt: -1}, limit: 25});
});

// List All Games
Meteor.publish('gamesList', function() {
    return Games.find({}, {sort: {createdAt: -1}});
});

// Single Game
Meteor.publish('game', function(gameId) {
    return Games.find(gameId);
});