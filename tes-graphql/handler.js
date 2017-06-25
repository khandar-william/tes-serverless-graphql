'use strict';

const fs = require('fs');
const path = require('path');

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

// const schema = require('./schema');

const makeExecutableSchema = require('graphql-tools').makeExecutableSchema;
const typeDefs = fs.readFileSync(path.resolve(__dirname, 'schema.graphql'), 'utf-8');
const resolvers = require('./schema.resolvers');
const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

module.exports.graphql = (event, context, callback) => {
  var payload = maybeJson(event.body);
  var requestString = payload[Object.keys(payload)[0]]; // query, mutation ...
  
  graphql(schema, requestString)
    .then(body => callback(null, {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      statusCode: 200,
      body: JSON.stringify(body)
    }));
};
