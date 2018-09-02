var mongoose = require('mongoose');

let schema = mongoose.Schema({
    recipe: Object,
    hits: Number,
    firedAction: Boolean,
    created_at: Date,
    result: Object
});

module.exports = mongoose.model('Execution', schema);