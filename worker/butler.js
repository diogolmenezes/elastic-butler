const elasticsearch = require('elasticsearch');

// Butler worker
class Butler {
    constructor() {
        this.moment = require('moment');
        this.config = require('../config');
        this.util = require('../service/util');
        this.recipeService = require('../service/recipeService');
        this.executionService = require('../service/executionService');
        this.timers = [];
    };

    // Get and schedule recipes
    run() {
        this._lookForRecipeUpdates();

        setInterval(() => {
            this._lookForRecipeUpdates();
        }, (this.config.worker.lookForRecipeUpdatesInterval * 60) * 1000);
    };

    // Clear the timer to stop the recipe execution
    _stopRecipeScheduler(recipe) {
        console.log(`Butler => Removing the recipe [${recipe.application}] [${recipe.name}] from scheduler`);
        let timer = this.timers.find(x => x.recipe === recipe);

        clearInterval(timer.interval);

        this.timers = this.timers.filter(x => x.recipe !== recipe);
    }

    // Start the scheduler for recipe
    _startRecipeScheduler(recipe) {
        console.log(`Butler => Scheduling the recipe [${recipe.application}] [${recipe.name}] every [${recipe.interval}] minutes`);

        // removing from mongoose wrapper
        if (recipe.toObject)
            recipe = recipe.toObject();

        let alreadExists = this.timers.some(x => x.recipe === recipe);

        if (alreadExists) {
            this._stopRecipeScheduler(recipe);
        }

        let interval = setInterval(() => {
            this._make(recipe);
        }, (recipe.interval * 60) * 1000);

        this.timers.push({
            recipe: recipe,
            interval
        });
    }

    // Look for new recipes or changes in existing recipes
    _lookForRecipeUpdates() {
        console.log(`Butler => Looking for recipes...`);

        this.recipeService.findActive()
            .then(recipes => {
                if(this.config.store.type === "mongo") {
                    return recipes.map(recipe => recipe.toObject());
                } else {
                    return recipes;
                }
            })
            .then(recipes => {

                let toRemove = this.timers.filter(timer => !recipes.map(x => JSON.stringify(x)).includes(JSON.stringify(timer.recipe)));
                let toAdd    = recipes.filter(recipe => !this.timers.map(x => JSON.stringify(x.recipe)).includes(JSON.stringify(recipe)));
                let changes  = toRemove.length + toAdd.length;

                if (changes > 0)
                    console.log(`Butler => Adding ${toAdd.length} and removing ${toRemove.length} recipes`);

                toRemove.map(timer => {
                    this._stopRecipeScheduler(timer.recipe);
                });

                toAdd.map(recipe => {
                    this._startRecipeScheduler(recipe);
                });
            });
    }

    // Process the recipe, and if the limit is reached, it performs the action
    _make(recipe) {
        console.log(`Butler => Butler will process the recipe [${recipe.application}] [${recipe.name}]`);

        let base = this;
        let index = recipe.search.index;

        if (this.config.worker.useDateOnIndex)
            index = `${index}-${this.moment().format('YYYY.MM.DD')}`;
        else
            index = `${index}*`;

        let client = new elasticsearch.Client({
            host: recipe.elasticsearch
            //,log: 'trace'
        });

        client.search({
                index: index,
                body: base._buildQuery(recipe)
            })
            .then((searchResult) => {

                let haveToFireAction = searchResult.hits.total > recipe.search.limit;

                if (haveToFireAction)
                    base._doAction(recipe, searchResult);
                else {
                    // save the process result
                    base.executionService.save(recipe, searchResult.hits.total, false).catch((err) => {
                        console.log('err', err);
                    });
                    console.log(`Butler => Found [${searchResult.hits.total}] hits. No actions will be fired for recipe [${recipe.application}] [${recipe.name}]`);
                }
            });
    };

    // Build elastic search query
    _buildQuery(recipe) {
        let interval = this.util.getInterval(recipe.search.period);

        console.log(`Butler => Period was calculated for recipe [${recipe.application}] [${recipe.name}] [${interval.initialDate.format()}] until [${interval.finalDate.format()}]`);

        if (recipe.search.complex_query)
            return recipe.search.complex_query;
        else {
            return {
                "query": {
                    "bool": {
                        "must": [{
                                "query_string": {
                                    "query": recipe.search.query,
                                    "analyze_wildcard": true
                                }
                            },
                            {
                                "range": {
                                    "@timestamp": {
                                        "gte": `${interval.initialDate.unix()}000`,
                                        "lte": `${interval.finalDate.unix()}000`,
                                        "format": "epoch_millis"
                                    }
                                }
                            }
                        ],
                        "must_not": []
                    }
                }
            };
        }
    };

    // Get information about the execution
    _getDetail(recipe, searchResult) {
        return `<p><strong>Hits:</strong> ${searchResult.hits.total}</p>
                <p><strong>ElasticSearch:</strong><a href="${recipe.elasticsearch}">${recipe.elasticsearch}</a></p>
                <p><strong>Kibana:</strong><a href="${recipe.kibana}">${recipe.kibana}</a></p>
                <p><strong>Application:</strong> ${recipe.application}</p>
                <p><strong>Recipe:</strong> ${recipe.name}</p>
                <p><strong>Index:</strong> ${recipe.search.index}</p>
                <p><strong>Query:</strong> ${recipe.search.query}</p>
                <p><strong>Interval:</strong> ${recipe.interval}</p>
                <p><strong>Period:</strong> ${recipe.search.period}</p>
                `;
    };

    // Do the action
    _doAction(recipe, searchResult) {
        let base = this;
        let sender = {};

        // clone recipe object, because we will change it to add detail
        recipe = Object.assign({}, recipe);

        console.log(`Butler => The recipe [${recipe.application}] [${recipe.name}] will be executed because needed [${recipe.search.limit}] hits and had [${searchResult.hits.total}] hits`);

        recipe.detail = this._getDetail(recipe, searchResult);

        sender = this._getSender(recipe.action.type);

        sender.send(recipe, searchResult)
            .then((result) => {
                console.log(`Butler => Action executed with success for recipe [${recipe.application}] [${recipe.name}]`);
                base.executionService.save(recipe, searchResult.hits.total, true, result).catch((err) => {
                    console.log('err', err);
                });
            })
            .catch((error) => {
                console.log(`Butler => Error executing the action for recipe [${recipe.application}] [${recipe.name}]`, error)
                base.executionService.save(recipe, searchResult.hits.total, true, error.stack).catch((err) => {
                    console.log('err', err);
                });
            });
    };

    // Sender factory
    // The sender file must have the same name as the recipe action type
    // If you want to create new senders, just put on senders folder a class
    // with the method "send" that to what you need
    _getSender(type) {
        return require(`./senders/${type}`);
    }
};

module.exports = new Butler();