// playerInfo
    var playerInfo = new SimpleSchema({
        id: {
            type: String
        },

        name: {
            type: String
        },

        image: {
            type: String
        },

        ready: {
            type: Boolean
        },

        score: {
            type: Number
        },

        winner: {
            type: Boolean
        }
    });

// is
    var is = new SimpleSchema({
        playing: {
            type: Boolean
        },

        completed: {
            type: Boolean
        },

        isPublic: {
            type: Boolean
        }
    });

// chat
    var conversation = new SimpleSchema({
        id: {
            type: String
        },

        userKey: {
            type: Number
        },

        name: {
            type: String
        },

        text: {
            type: String
        }
    });

    var chat = new SimpleSchema({
        show: {
            type: Boolean
        },

        conversation: {
            type: [conversation]
        }
    });

// sets
    var result = new SimpleSchema({
        winner: {
            type: String
        },

        using: {
            type: String
        }
    });

    var set = new SimpleSchema({
        piece: {
            type: [String]
        },

        number: {
            type: Number
        },

        matrix: {
            type: String
        },

        highlightCells: {
            type: String
        },

        result: {
            type: result,
            optional: true
        }
    });

// status
    var status = new SimpleSchema({
        playerJoined: {
            type: Boolean
        },

        turn: {
            type: Number
        }
    });

// computer
var computer = new SimpleSchema({
    selected: {
        type: Boolean
    },

    level: {
        type: Number
    }
})

// Games
Games.attachSchema(new SimpleSchema({
    players: {
        type: [playerInfo]
    },

    computer: {
        type: computer
    },

    sets: {
        type: [set],
        optional: true
    },

    chat: {
        type: chat,
        optional: true
    },

    status: {
        type: status
    },

    is: {
        type: is
    },

    createdAt: {
        type: Date,
        autoValue: function() {
            if (this.isInsert) {
                return new Date();
            } else if (this.isUpsert) {
                return {$setOnInsert: new Date()};
            } else {
                this.unset();
            }
        }
    },

    updatedAt: {
        type: Date,
        autoValue: function() {
            if (this.isUpdate) {
                return new Date();
            }
        },
        denyInsert: true,
        optional: true
    }
}));