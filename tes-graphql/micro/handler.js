/*
Tes SNS events
*/
'use script';

var AWS = require('aws-sdk');
var sns = new AWS.SNS();

module.exports.tesPublisher = (event, context, callback) => {
  console.log('tesPublisher start');

  sns.publish({
      Message: 'Can You See?',
      TopicArn: 'arn:aws:sns:us-east-1:840833276718:NOWYOUSEEME',
  }, function(err, data) {
    if (err) {
      console.error(err.stack);
      callback(err);  
      return;
    }
    console.log('tesPublisher sent');
    console.log(data);
    callback(null, {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/html',
      },
      body: '<h1>tesPublisher sent</h1>',
    });
  });
};

module.exports.tesSubscriber = (event, context, callback) => {
  console.log('tesSubscriber start');
  console.log('Message is ' + event.Records[0].Sns.Message);
};