const recipeService = require('./service/recipeService');

let recipe = {
    name: 'test-recipe',
    application: 'test',
    active: true,
    elasticsearch: 'http://localhost:9200',
    kibana: "http://localhost:5601",
    interval: 1,
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

recipeService.save(recipe);