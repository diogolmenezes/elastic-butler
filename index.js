const config   = require('./config');
const database = require('./config/database');

if(config.store.type === "mongo") {
    database.connect(config.store);
}

// starting the worker
let butler = require('./worker/butler');
butler.run();



