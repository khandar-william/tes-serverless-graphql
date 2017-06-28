/*
Demo of using custom authorizer
Requiring custom header
On Graphql API
*/

'use strict';

const fs = require('fs');
const path = require('path');
const { StringDecoder } = require('string_decoder');
const decoder = new StringDecoder('utf8');

var g = require('graphql');
var graphql = g.graphql;
var buildSchema = g.buildSchema;

var maybeJson = str => {
  try {
    return JSON.parse(str);
  } catch (e) {
    return str;
  }
};

var getSecret = (headerValue) => {
  var kode = headerValue.match(/Basic (.+)$/);
  kode = kode[1];
  var buf = Buffer.from(kode, 'base64');
  var decoded = decoder.write(buf);
  kode = decoded.match(/^(.+):(.+)$/);
  if (kode.length == 3) {
    var part1 = kode[1];
    var part2 = kode[2];
    return (part1 == part2) ? part1 : null;
  } else {
    return null;
  }
};

const makeExecutableSchema = require('graphql-tools').makeExecutableSchema;
const typeDefs = fs.readFileSync(path.resolve(__dirname, 'gold.graphql'), 'utf-8');
const resolvers = require('./gold.resolvers');
const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

module.exports.graphql = (event, context, callback) => {
  
  var minerName = event.requestContext.authorizer.minerName; // from authorizer
  var payload = maybeJson(event.body);
  var requestString = payload[Object.keys(payload)[0]]; // query, mutation ...
  
  graphql(schema, requestString, null, {miner: minerName})
    .then(body => callback(null, {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      statusCode: 200,
      body: JSON.stringify(body)
    }));
};

var generatePolicy = function(principalId, effect, resource, minerName) {
    var authResponse = {};
    
    authResponse.principalId = principalId;
    if (effect && resource) {
        var policyDocument = {};
        policyDocument.Version = '2012-10-17'; // default version
        policyDocument.Statement = [];
        var statementOne = {};
        statementOne.Action = 'execute-api:Invoke'; // default action
        statementOne.Effect = effect;
        statementOne.Resource = resource;
        policyDocument.Statement[0] = statementOne;
        authResponse.policyDocument = policyDocument;
    }
    
    // Can optionally return a context object of your choosing.
    authResponse.context = {
      minerName: minerName,
    };
    return authResponse;
}

module.exports.cekKodeRahasia = (event, context, callback) => {
  console.log(event);
  if (!event.authorizationToken) {
    return callback('Harus Pakai Kode Rahasia');
  }

  var minerName = getSecret(event.authorizationToken);
  if (!minerName) {
    return callback('Harus Pakai Kode Rahasia');
  }

  callback(null, generatePolicy('user', 'Allow', event.methodArn, minerName));
};