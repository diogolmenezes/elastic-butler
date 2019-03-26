const elasticsearch = require('elasticsearch');
const config = require('../config');
const util = require('./util');

// this class is able to find and save items at recipe elastic search index
class RecipeService {
    constructor() {
        this.index = config.store.recipeIndex;
        this.client = new elasticsearch.Client({
            host: config.store.uri
        });
    };

    // find active recipes in recipe index
    async findActive() {
        const hits = await this.client.search({
                index: this.index,
                body: {
                    query: {
                        match: {
                            active: true
                        }
                    }
                }
            })
            .then((searchResult) => util.getSourceArrayFromElasticHits(searchResult.hits.hits));

        return hits;
    };

    // save a new recipe at recipe index
    async save(recipe) {
        await this.client.index({
            index: this.index,
            type: 'recipe',
            body: recipe
        });
    };
};

module.exports = new RecipeService();