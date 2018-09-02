class ExecutionService {
    constructor() {
        this.model = require('../model/execution');
    };

    find(query) {
        return this.model.find(query);
    };

    findLast() {
        return this.model.find({}).sort({ created_at: -1 }).limit(500);
    };

    save(recipe, hits, firedAction, result) {
        console.log(`Butler => Saving process result for recipe [${recipe.application}] [${recipe.name}]`);
        let execution = new this.model({
            recipe: recipe,
            hits: hits,
            firedAction: firedAction,
            result: result,
            created_at: new Date()
        });
        return execution.save();
    };
};

module.exports = new ExecutionService();