const dbGold = require('./golddb');

const resolvers = {
  Query: {
    golds: () => dbGold.getGolds(),
    miners: () => dbGold.getMiners(),
    miner: (_, args) => dbGold.getMiner(args.name),
  },
  Mutation: {
    mineGold: (_, args, context) => dbGold.createGold(context.miner, args.amount),
  },
  Gold: {
    miner: gold => dbGold.getMiner(gold.miner_name),
  },
  Miner: {
    golds: miner => dbGold.getGoldsOwned(miner.name),
  },
};

module.exports = resolvers;