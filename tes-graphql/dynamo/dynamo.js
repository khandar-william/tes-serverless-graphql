console.log('start dynamo');
const AWS = require('aws-sdk');
console.log('after aws-sdk');

const dynamoDb = new AWS.DynamoDB.DocumentClient();
console.log('after dynamoDB');

module.exports.scan = function (params) {
  return new Promise((resolve, reject) => {
    return dynamoDb.scan(params).promise()
      .then(data => resolve(data.Items))
      .catch(err => reject(err));
  });
};

module.exports.get = function (params) {
  return new Promise((resolve, reject) => {
    return dynamoDb.get(params).promise()
      .then(data => resolve(data.Item))
      .catch(err => reject(err));
  });
};

module.exports.createItem = function (params) {
  return new Promise((resolve, reject) => {
    return dynamoDb.put(params).promise()
      .then(() => resolve(params.Item))
      .catch(err => reject(err));
  });
};

module.exports.updateItem = function (params, args) {
  return new Promise((resolve, reject) => {
    return dynamoDb.update(params).promise()
      .then(() => resolve(args))
      .catch(err => reject(err));
  });
};

module.exports.deleteItem = function (params, args) {
  return new Promise((resolve, reject) => {
    return dynamoDb.delete(params).promise()
      .then(() => resolve(args))
      .catch(err => reject(err));
  });
};
