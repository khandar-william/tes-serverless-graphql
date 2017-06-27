const request = require('request');

var endpoint = 'https://vwzz8of023.execute-api.us-east-1.amazonaws.com/dev/graphql';
var query = `
mutation {
  createArtist(first_name: "ALex", last_name:"Bono") {
    id
    first_name
    last_name
  }
}`;
var body = JSON.stringify({
  query: query,
  variables: null,
  operationName: null,
});

request.post({
  url: endpoint,
  body: body,
}, function (error, response, body) {
  console.log('Status ' + response.statusCode);
  console.log(body);
});