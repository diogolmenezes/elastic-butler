# Elastic Butler

Elastic butler were born at **Oi** telecomunication company as a **open source alternative** to [Elastic Stack Alerting tool](https://www.elastic.co/products/stack/alerting).

With butler you get notified if your data has a pattern set by you.

- Notify me by mail if there are more than 10 fail login attempts in the last 20 minutes
- Notify me by if we sell more than 1000 iphones in the last day

You are free to create your own [recipes](#recipes) and [notification types](#creating-senders).

## Get Started

In addition to elastic search, it will be necessary a mongo database for running Buttler. The mongo databese will store all your monitoring recipes.

If you already have a running mongo and elastic search, just set up at **config/env.json** file. *If you don't have this yet, you can use our test [sandbox](#sandbox))*

Create your [recipes](#recipes) than start butler.

```bash
npm start
```

Butler uses the @timestamp field to do the "period" filter. [Make sure your index has this field](https://www.elastic.co/guide/en/elasticsearch/reference/5.0/breaking_50_mapping_changes.html#_literal__ttl_literal_and_literal__timestamp_literal_cannot_be_created).


![Execution](https://github.com/diogolmenezes/elastic-butler/blob/master/_doc/execution.png)
![Email](https://github.com/diogolmenezes/elastic-butler/blob/master/_doc/email-2.png)

## Recipes

Butler will search for recipes at your mongo database.

A recipe describe the operation of monitoring. This is how a recipe looks like:

```json
{
    "name": "test-recipe",
    "application": "test",
    "active": true,
    "elasticsearch": "http://localhost:9200",
    "kibana": "http://localhost:5601",
    "interval": 10,
    "search": {
        "index": "shakespeare",
        "query": "\"with love\"",
        "limit": 10,
        "period": "10 m"
    },
    "action": {
        "type": "gmail",
        "to": "destination@email.com",
        "subject": "[#hits#] hits at [#application# #recipe#]",
        "body": "<p>Your recipe results:</p> #detail#"
    }
}
```

### Recipe description:

- **name**: Recipe name
- **application**: Monitored application name
- **elasticsearch**: Elastic-search url with port information (Ex: localhost:9200)
- **search**: This is the object to specify the search
- **search.index**: Search index name. If you set dateOnIndex at **config/env.json**, butler will add the current date (-YYYY-MM-DD) at the end of index name.
- **search.query**: Elastic search query. (Ex.: code:\"500\" && \"EXTERNAL API ERROR\")
- **search.limit**: Limit of hits until action be executed
- **search.period**: Period in minutes that the occurrence will be searched. (Ex: 20 m) "At last 20 minutes"
- **action**: This is the object to specify the action. For default butler has 2 action types ([gmail](#gmail-recipe-sample) and [twiliosms](#twiliosms-recipe-sample)). Butler will search for this type at **worker/senders** folder. You can create your own sender.

### Gmail action type

This action is part of butler default solution, and uses a gmail account to send the notification.

- **action.type**: gmail
- **action.to**: Recipient's email
- **action.subject**: Mail subject. Tags #hits#, #application# and #recipe# will be replaced with recipe data
- **action.body**: Mail body. Tag #detail# will be replaced with search result data

#### Gmail recipe sample

```json
{
    "name" : "test-recipe",
    "application" : "test",
    "active" : false,
    "elasticsearch" : "http://localhost:9200",
    "kibana" : "http://localhost:5601",
    "interval" : 10,
    "action" : {
        "body" : "<p>Your recipe results:</p> #detail#",
        "subject" : "[#hits#] hits at [#application# #recipe#]",
        "to" : "destination@gmail.com",
        "type" : "gmail"
    },
    "search" : {
        "index" : "shakespeare",
        "query" : "\"with love\"",
        "limit" : "10",
        "period" : "60 m"
    }
}
```

### Twiliosms action type

This action is part of butler default solution, and uses a twilio account to send sms.

- **action.type**: twiliosms
- **action.to**: Recipient's phone number (Ex: +5521999998888)
- **action.body**: Sms body. Tags #hits#, #application# and #recipe# will be replaced with recipe data

#### Twiliosms recipe sample

```json
{
    "name" : "test-recipe-sms",
    "application" : "test",
    "active" : true,
    "elasticsearch" : "http://localhost:9200",
    "kibana" : "http://localhost:5601",
    "interval" : 10,
    "action" : {
        "body" : "#application# #recipe# => #hits# hits",
        "to" : "+5521999998888",
        "type" : "twiliosms"
    },
    "search" : {
        "index" : "shakespeare",
        "query" : "\"with love\"",
        "limit" : "10",
        "period" : "6000 m"
    }
}
```

### Slack Action Type
This action is part of butler default solution, and uses a slack webhook to send a message.

This action allows you to specify multiple slack webhooks to alert different rooms depending on your recipe.

#### Setup
1. Go to https://{yourteam}.slack.com/apps
1. Install Incoming Webhooks.
1. Generate a new webhook for your recipe.
1. Copy the url and include it in the recipe.

#### Action Attributes

- **action.type**: slack
- **action.webhookUrl**: https://hooks.slack.com/services/...
- **action.username**: Elastic Butler
- **action.icon_emoji**: ghost
- **action.message**: Message body. Tags #hits#, #application# and #recipe# will be replaced with recipe data

#### Slack recipe sample
```json
{
    "name" : "test-recipe",
    "application" : "test",
    "active" : true,
    "elasticsearch" : "http://localhost:9200",
    "kibana" : "http://localhost:5601",
    "interval" : 1,
    "action" : {
        "type" : "slack",
        "message": "[#application#] recieved [#hits#] hits for [#recipe#]",
        "webhookUrl": "https://hooks.slack.com/services/...",
        "username": "Elastic Butler",
        "icon_emoji": "ghost"
    },
    "search" : {
        "index" : "shakespeare",
        "query" : "\"with love\"",
        "limit" : "0",
        "period" : "10 m"
    }
}
```

## Sandbox

For test propouses you can use our sandbox to create an initial test environment:

```bash
cd _sandbox

sudo ./sandbox.sh up -d
```

Our sandbox will use docker-compose to run mongo, elastic-search and kibana containers.

After containers are running, you should need import some [sample data](https://www.elastic.co/guide/en/kibana/current/tutorial-load-dataset.html):

Add sample index mapping at http://localhost:5601/app/kibana#/dev_tools/console

```http
PUT /shakespeare
{
    "mappings": {
        "doc": {
            "properties": {
                "speaker": {
                    "type": "keyword"
                },
                "play_name": {
                    "type": "keyword"
                },
                "line_id": {
                    "type": "integer"
                },
                "speech_number": {
                    "type": "integer"
                }
            }
        }
    }
}
```

Add the @timestamp ingest to automatic include timestamp information in you data.

```http
PUT _ingest/pipeline/timestamp
{
  "description" : "Adds a timestamp field at the current time",
  "processors" : [ {
    "set" : {
      "field": "@timestamp",
      "value": "{{_ingest.timestamp}}"
    }
  } ]
}
```

Now you can import some sample data to your index:

```bash
cd _sandbox/sample_data

curl -H 'Content-Type: application/x-ndjson' -XPOST 'localhost:9200/shakespeare/doc/_bulk?pretty&pipeline=timestamp' --data-binary @shakespeare_6.0.json
```

## Docker

To run butler on a docker container you need to adjust **config/env.json**:

- Edit mongo configuration url and options
- Edit senders configurations

Than just run:

```bash
cd _docker

sudo ./up.sh
```

If you want to see container logs:

```bash
sudo docker logs butler
```

To stop butler:

```bash
cd _docker

sudo ./down.sh
```

## Creating senders

You can create your own butler sender. To do this you have to create a sender class at **worker/senders** folder with the name of your type:

```javascript
// worker/senders/sms.js
class SmsSender {

    constructor() {
        this.config = require('../../config');
    }

    // Send recipe result by sms
    send(recipe, searchResult) {
        let message = this._getInfo(recipe.action.body, recipe, searchResult);
        // send the sms notification here...
    };

    _getInfo(text, recipe, searchResult) {
        return text
                .replace('#application#', recipe.application)
                .replace('#recipe#', recipe.name)
                .replace('#hits#', searchResult.hits.total);
    }
};

module.exports = new SmsSender();
```

Than you can create a recipe using your new sender:

```json
{
    "name": "Error 500 on process recipe",
    "application": "My Application",
    "active": true,
    "elasticsearch": "http://localhost:9200",
    "kibana": "http://localhost:5601",
    "interval": 10,
    "search": {
        "index": "shakespeare",
        "query": "\"process\" && code: \"500\"",
        "limit": 10,
        "period": "10 m"
    },
    "action": {
        "type": "sms",
        "to": "2199999-8888",
        "body": "#application# #recipe# => #hits# hits"
    }
}
```

## TTL

Butler stores all execution results at mongo "executions" collection.

If you want these executions to expire so that your database does not get too full, you have to set the TTL.

```javascript
db.getCollection('executions').createIndex( { "created_at": 1 }, { expireAfterSeconds: 10800 } )
```
