const elasticsearch = require('elasticsearch');
const config = require('../config');
const util = require('./util');

class ExecutionService {
    constructor() {
        this.storeType = config.store.type;
        this.executionIndex = config.store.executionIndex;
        this.model = require('../model/execution');

        if(this.storeType === "elasticsearch") {
            this.client = new elasticsearch.Client({
                host: config.store.uri
            });
        }
    };

    async find(query) {
        if(this.storeType === "elasticsearch") {
            await this.client.search({
                index: index,
                body: query
            })
            .then((searchResult) => {
                return util.getSourceArrayFromElasticHits(searchResult.hits.hits);
            });
        } else if (this.storeType === "mongo") {
            return this.model.find(query);
        }
        return null;
    };

    async findLast() {
        if(this.storeType === "elasticsearch") {
            await client.search({
                index: this.recipeIndex,
                body: {
                    sort: [{
                        "created_at": {
                            order: "desc"
                        }
                    }],
                    limit: 500
                }
            })
            .then((searchResult) => {
                return util.getSourceArrayFromElasticHits(searchResult.hits.hits);
            });
        } else if (this.storeType === "mongo") {
            return this.model.find({}).sort({ created_at: -1 }).limit(500);
        }

        return null;
    };

    async save(recipe, hits, firedAction, result) {
        console.log(`Butler => Saving process result for recipe [${recipe.application}] [${recipe.name}]`);
        let executionObj = {
            recipe: recipe,
            hits: hits,
            firedAction: firedAction,
            result: result,
            created_at: new Date()
        }


        if(config.store.type === "elasticsearch") {
            await this.client.create({
                index: config.store.executionIndex,
                type: 'execution',
                id: '1',
                body: executionObj
            });

        } else if (config.store.type === "mongo") {
            let execution = new this.model(executionObj);
            return execution.save();
        }
    };
};

module.exports = new ExecutionService();