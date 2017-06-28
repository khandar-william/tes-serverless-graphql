const request = require('request');

var endpoint = 'https://vwzz8of023.execute-api.us-east-1.amazonaws.com/dev/gold';
// var endpoint = 'http://localhost:3000/gold';
var query = `
mutation {
  mineGold(amount:11) {
    id
    miner {
      name
      wealth
    }
    amount
  }
}`;
var body = JSON.stringify({
  query: query,
});

request.post({
  url: endpoint,
  headers: {
    'Authorization': 'Basic ' + Buffer.from('arjuna:arjuna').toString('base64'),
  },
  body: body,
}, function (error, response, body) {
  console.log('Status ' + response.statusCode);
  console.log('Body ' + body);
});