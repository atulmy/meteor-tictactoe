// Publish Games collection to client

// Online Games
Meteor.publish('gamesOnline', function() {
    var now = new Date().getTime();
    var msInDay = 1000 * 60 * 60 * 1;
    return Games.find({"is.isPublic": true, "is.playing": false, "is.completed": false, createdAt:{$gte: new Date(now - msInDay)}}, {sort: {createdAt: -1}, limit: 25});
});

// List All Games
Meteor.publish('gamesList', function() {
    return Games.find({}, {sort: {createdAt: -1}});
});

// Single Game
Meteor.publish('game', function(gameId) {
    return Games.find(gameId);
});