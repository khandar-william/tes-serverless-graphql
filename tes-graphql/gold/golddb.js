const uuid = require('uuid/v1');
const db = require('../dynamo/dynamo');

const GoldTableName = 'golds';
const MinerTableName = 'miners';

module.exports.getGolds = function () {
  const params = {
    TableName: GoldTableName,
    AttributesToGet: [
      'id',
      'miner_name',
      'amount',
    ],
  };

  return db.scan(params);
};

module.exports.getGoldsOwned = function (minerName) {
  const params = {
    TableName: GoldTableName,
    AttributesToGet: [
      'id',
      'miner_name',
      'amount',
    ],
    FilterExpression: 'miner_name = :name',
    ExpressionAttributeValues: {
      ':name': minerName,
    },
  };

  return db.scan(params);
};


module.exports.getMiners = function () {
  const params = {
    TableName: MinerTableName,
    AttributesToGet: [
      'name',
      'wealth',
    ],
  };

  return db.scan(params);
};

module.exports.getMiner = function (name) {
  const params = {
    TableName: MinerTableName,
    Key: {
      name: name,
    },
  };

  return db.get(params);
};

module.exports.createGold = function (minerName, amount) {
  const paramsGold = {
    TableName: GoldTableName,
    Item: {
      id: uuid(),
      miner_name: minerName,
      amount: amount,
    },
  };

  const paramsMiner = {
    TableName: MinerTableName,
    Item: {
      name: minerName,
      wealth: amount,
    },
  };

  const paramsMinerUpdate = {
    TableName: MinerTableName,
    Key: {
      name: minerName,
    },
    ExpressionAttributeValues: {
      ':amount': amount,
    },
    UpdateExpression: 'SET wealth = wealth + :amount',
    ReturnValues: 'ALL_NEW',
  };

  return db.createItem(paramsGold)
    .then(() => module.exports.getMiner(minerName))
    .then((miner) => {
      if (miner) {
        return db.updateItem(paramsMinerUpdate, paramsGold.Item);
      } else {
        return db.createItem(paramsMiner);
      }
    })
    .then(() => paramsGold.Item);
};
