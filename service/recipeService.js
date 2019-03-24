const elasticsearch = require('elasticsearch');
const config = require('../config');
const util = require('./util');

class RecipeService {
    constructor() {
        this.storeType = config.store.type;
        this.recipeIndex = config.store.recipeIndex;
        this.model = require('../model/recipe');

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

    async findActive() {
        if(this.storeType === "elasticsearch") {
            let hits;
            await this.client.search({
                index: this.recipeIndex,
                body: {
                    query: {
                        match: {
                            active: true
                        }
                    }
                }
            })
            .then((searchResult) => {
                hits = util.getSourceArrayFromElasticHits(searchResult.hits.hits);
            });
            return hits;
        } else if (this.storeType === "mongo") {
            return this.model.find({ active: true });
        }

        return null;
    };
};

module.exports = new RecipeService();