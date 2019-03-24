const elasticsearch = require('elasticsearch')

const config = require('./config');
const database = require('./config/database');
const Recipe = require('./model/recipe');

let recipeObj = {
    name: 'test-recipe',
    application: 'test',
    active: true,
    elasticsearch: 'http://localhost:9200',
    kibana: "http://localhost:5601",
    interval: 10,
    search: {
        index: 'shakespeare',
        query: '"with love"',
        limit: 10,
        period: '10 m'
    },
    action: {
        type: 'gmail',
        to: 'diogolmenezes@gmail.com',
        subject: '[#hits#] hits at [#application# #recipe#]',
        body: '<p>Your recipe results:</p> #detail#'
    }
};

if(config.store.type === "elasticsearch") {
    let client = new elasticsearch.Client({
        host: config.store.uri
    });

    client.create({
        index: config.store.recipeIndex,
        type: 'recipe',
        id: '1',
        body: recipeObj
      });

} else if (config.store.type === "mongo") {
    database.connect(config.db);
    var recipe = new Recipe(recipeObj);
    recipe.save();
}
