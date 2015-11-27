// Set up login services
Meteor.startup(function() {
    // Add Facebook configuration entry
    ServiceConfiguration.configurations.update(
        { service: "facebook" },
        {
            $set: {
                appId: "1067278643307006",
                secret: "f57889e680e079adc694eebbf60bcce0"
            }
        },
        { upsert: true }
    );

    // Add Google configuration entry
    ServiceConfiguration.configurations.update(
        { service: "google" },
        {
            $set: {
                clientId: "306177502544-6rcj4p4k8hmm4a9bu06193n2dkisgetn.apps.googleusercontent.com",
                client_email: "atul.12788@gmail.com",
                secret: "KlQJnf3dBu4QlKjy8ia_lvFJ"
            }
        },
        { upsert: true }
    );
});


Accounts.onCreateUser(function(options, user) {
    console.log(user);
    if(user.services.facebook !== undefined) {
        options.profile.picture = "http://graph.facebook.com/" + user.services.facebook.id + "/picture/?width=400&height=400";
    } else if (user.services.google !== undefined) {
        options.profile.picture = user.services.google.picture;
    } else if (user.services.twitter !== undefined) {
        options.profile.picture = user.services.twitter.picture;
    } else {
        options.profile.picture = '/images/default-user-image.jpg';
    }
    user.profile = options.profile;
    return user;
});