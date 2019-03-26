const elasticsearch = require('elasticsearch');
const config = require('../config');
const util = require('./util');

// this class is able to find and save items at execution elastic search index
class ExecutionService {
    constructor() {
        this.index = config.store.executionIndex;
        this.client = new elasticsearch.Client({
            host: config.store.uri
        });
    };   

    // save a new execution at axecution index
    async save(recipe, hits, firedAction, result) {
        console.log(`Butler => Saving process result for recipe [${recipe.application}] [${recipe.name}]`);

        let execution = {
            recipe: recipe,
            hits: hits,
            firedAction: firedAction,
            result: result,
            created_at: new Date()
        }

        await this.client.index({
            index: this.index,
            type: 'execution',
            body: execution
        });
    };
};

module.exports = new ExecutionService();