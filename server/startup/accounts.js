// Set up login services
Meteor.startup(function() {
    // Add Facebook configuration entry
    ServiceConfiguration.configurations.update(
        { service: "facebook" },
        {
            $set: {
                appId: "880293582007783",
                secret: "fa564d233412ae91ebbb6bf351aef07e"
            }
        },
        { upsert: true }
    );

    // Add Google configuration entry
    ServiceConfiguration.configurations.update(
        { service: "google" },
        {
            $set: {
                clientId: "741878676444-hhdh8tdm5nu49ofnjrokjoj0q5r5dd9l.apps.googleusercontent.com",
                client_email: "atul.12788@gmail.com",
                secret: "WaLDFML__H_jJS-SRzgCcmZO"
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