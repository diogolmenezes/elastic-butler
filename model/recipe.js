var mongoose = require('mongoose');

let schema = mongoose.Schema({
    application: String,
    name: String,
    active: Boolean,
    elasticsearch: String,
    kibana: String,
    interval: Number,
    search: {
        index: String,
        query: String,
        limit: String,
        period: String
    },
    action: Object
});

module.exports = mongoose.model('Recipe', schema);