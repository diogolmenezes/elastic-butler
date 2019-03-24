class Util {
    constructor() {
        this.moment = require('moment');
    };

    getInterval(interval) {
        let split = interval.split(' ');

        interval = interval.toLowerCase();

        if (split.length === 2)
            return { initialDate: this.moment().subtract(parseInt(split[0]), split[1]), finalDate: this.moment() };
        if (interval === 'today')
            return { initialDate: this.moment().startOf('day'), finalDate: this.moment().endOf('day') };
        if (interval === 'yesterday')
            return { initialDate: this.moment().subtract(1, 'day').startOf('day'), finalDate: this.moment().subtract(1, 'day').endOf('day') };
        if (interval === 'year')
            return { initialDate: this.moment().startOf('year'), finalDate: this.moment().endOf('year') };
        if (interval === 'month')
            return { initialDate: this.moment().startOf('month'), finalDate: this.moment().endOf('month') };
        if (interval === 'week')
            return { initialDate: this.moment().startOf('week'), finalDate: this.moment().endOf('week') };
    };

    getSourceArrayFromElasticHits(hits) {
        let resultArray = [];

        hits.forEach((hit) => {
            resultArray.push(hit._source);
        });
        
        return resultArray;
    }
};

module.exports = new Util();