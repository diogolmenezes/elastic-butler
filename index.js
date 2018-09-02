const config   = require('./config');
const database = require('./config/database');

database.connect(config.db);

// starting the worker
let butler = require('./worker/butler');
butler.run();



