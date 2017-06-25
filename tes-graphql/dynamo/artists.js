const uuid = require('uuid/v1');
const db = require('./dynamo');

const TableName = 'artists';

module.exports.getArtists = function () {
  const params = {
    TableName,
    AttributesToGet: [
      'id',
      'first_name',
      'last_name',
    ],
  };

  return db.scan(params);
};

module.exports.getArtistById = function (id) {
  const params = {
    TableName,
    Key: {
      id,
    },
  };

  return db.get(params);
};

module.exports.createArtist = function (args) {
  const params = {
    TableName,
    Item: {
      id: uuid(),
      first_name: args.first_name,
      last_name: args.last_name,
    },
  };

  return db.createItem(params);
};

module.exports.updateArtist = function (args) {
  const params = {
    TableName: 'artists',
    Key: {
      id: args.id,
    },
    ExpressionAttributeValues: {
      ':first_name': args.first_name,
      ':last_name': args.last_name,
    },
    UpdateExpression: 'SET first_name = :first_name, last_name = :last_name',
    ReturnValues: 'ALL_NEW',
  };

  return db.updateItem(params, args);
};

module.exports.deleteArtist = function (args) {
  const params = {
    TableName,
    Key: {
      id: args.id,
    },
  };

  return db.deleteItem(params, args);
};
