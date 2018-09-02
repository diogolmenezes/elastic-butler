class GmailSender {

    constructor() {
        this.config = require('../../config');
        this.nodemailer = require('nodemailer');
    }

    // Send recipe result by gmail
    send(recipe, searchResult) {
        console.log(`Butler => Sending mail from gmail for recipe [${recipe.application}] [${recipe.name}]`);

        let action = recipe.action;

        var transportOptions = {
            service: 'Gmail',
            auth: {
                user: this.config.senders.gmail.user,
                pass: this.config.senders.gmail.pass,
            },
            logger: this.config.senders.gmail.logger,
            debug: this.config.senders.gmail.debug,
        };

        if (this.config.senders.gmail.proxy)
            transportOptions.proxy = this.config.senders.gmail.proxy

        let transporter = this.nodemailer.createTransport(transportOptions);

        let options = {
            from: `"${this.config.senders.gmail.name}" <${this.config.senders.gmail.user}>`,
            to: action.to,
            subject: this._getInfo(action.subject, recipe, searchResult),
            html: action.body.replace('#detail#', recipe.detail)
        };

        return transporter.sendMail(options);
    };

    _getInfo(text, recipe, searchResult) {
        return text
                .replace('#application#', recipe.application)
                .replace('#recipe#', recipe.name)
                .replace('#hits#', searchResult.hits.total);
    }
};

module.exports = new GmailSender();