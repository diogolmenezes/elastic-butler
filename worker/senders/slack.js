const request = require('request-promise');

class SlackSender {

    // Send recipe result by slack
    send(recipe, searchResult) {
        console.log(`Butler => Sending slack webhook for recipe [${recipe.application}] [${recipe.name}]`);
        let action = recipe.action;
        let message = this._getInfo(action.message, action.detailField, recipe, searchResult);

        return request({
            method: 'POST',
            uri: action.webhookUrl,
            json: true,
            body: {
                text: message,
                username: action.username,
                icon_emoji: `:${action.iconEmoji}:`
            }
        });
    };

    _getInfo(text, detailField, recipe, searchResult) {
        return text
                .replace('#application#', recipe.application)
                .replace('#recipe#', recipe.name)
                .replace('#hits#', searchResult.hits.total)
                .replace('#detail#', searchResult.hits.hits[0]._source[detailField]);
    }
};

module.exports = new SlackSender();