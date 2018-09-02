const twilio = require('twilio');

class TwilioSmsSender {

    constructor() {
        this.config = require('../../config');
        this.config = this.config.senders.twiliosms;
        this.client = new twilio(this.config.accountSid, this.config.authToken);
    }

    // Send recipe result by gmail
    send(recipe, searchResult) {
        console.log(`Butler => Sending twilio sms for recipe [${recipe.application}] [${recipe.name}]`);
        
        let action  = recipe.action;
        let message = this._getInfo(recipe.action.body, recipe, searchResult);

        this.client.messages.create({
            body: message,
            to: action.to,
            from: this.config.from
        }).then((message) => {
            console.log(`Butler => The sms was sended ${message.sid}`);
            return message;
        }).catch((error) => {
            console.log(`Butler => The sms was not sended`, error);
            throw error;
        });
    };

    _getInfo(text, recipe, searchResult) {
        return text
                .replace('#application#', recipe.application)
                .replace('#recipe#', recipe.name)
                .replace('#hits#', searchResult.hits.total);
    }
};

module.exports = new TwilioSmsSender();