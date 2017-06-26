const db = require('./dynamo');

const TableName = 'configura';

module.exports.setConfig = function (key, value) {
  const params = {
    TableName: TableName,
    Key: {
      id: key,
    },
    ExpressionAttributeValues: {
      ':value': value,
    },
    UpdateExpression: 'SET content = :value',
    ReturnValues: 'ALL_NEW',
  };

  return db.updateItem(params);
};

module.exports.getConfig = function (key) {
  const params = {
    TableName: TableName,
    Key: {
      id: key,
    },
  };

  return db.get(params).then(item => item ? item.content : null);
};
