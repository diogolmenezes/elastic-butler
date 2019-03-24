const request = require('request-promise');

class SlackSender {

    constructor() {
        this.config = require('../../config');
        this.config = this.config.senders.slack;
    }

    // Send recipe result by slack
    send(recipe, searchResult) {
        console.log(`Butler => Sending slack webhook for recipe [${recipe.application}] [${recipe.name}]`);
        let message = this._getInfo(recipe.action.body, recipe, searchResult);

        return request({
            method: 'POST',
            uri: this.config.webhookUrl,
            json: true,
            body: {
                text: message,
                username: this.config.username,
                icon_emoji: this.config.icon_emoji
            }
        });
    };

    _getInfo(text, recipe, searchResult) {
        return text
                .replace('#application#', recipe.application)
                .replace('#recipe#', recipe.name)
                .replace('#hits#', searchResult.hits.total);
    }
};

module.exports = new SlackSender();