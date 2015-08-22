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
                clientId: "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
                client_email: "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
                secret: "XXXXXXXXXXXXXXXXXXXXXXXX"
            }
        },
        { upsert: true }
    );
});