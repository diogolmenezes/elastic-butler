class Database {
    constructor() {
        this.mongoose    = require('mongoose');
        this.mongoose.Promise = Promise;
    };

    connect(config) {
        this.mongoose.connect(config.uri, config.options);
        this.mongoose.connection.once('open', function () {
            console.log(`Butler => Connected on ${config.uri}`);
        });

        this.mongoose.connection.on('error', console.error.bind(console, 'Butler => Connection error:'));
    };
}

module.exports = new Database();