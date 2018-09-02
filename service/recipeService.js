class RecipeService {
    constructor() {
        this.model = require('../model/recipe');
    };

    find(query) {
        return this.model.find(query);
    };

    findActive() {
        return this.model.find({ active: true });
    };
};

module.exports = new RecipeService();