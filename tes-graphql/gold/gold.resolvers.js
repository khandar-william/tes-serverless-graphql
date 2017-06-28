const dbGold = require('./golddb');
const DataLoader = require('dataloader');

const minerLoader = new DataLoader(names => Promise.all(names.map(dbGold.getMiner)));
const goldsOwnedLoader = new DataLoader(names => Promise.all(names.map(dbGold.getGoldsOwned)));

const resolvers = {
  Query: {
    golds: () => dbGold.getGolds(),
    miners: () => dbGold.getMiners(),
    miner: (_, args) => minerLoader.load(args.name || ''), // dbGold.getMiner(args.name),
  },
  Mutation: {
    mineGold: (_, args, context) => dbGold.createGold(context.miner, args.amount),
  },
  Gold: {
    miner: gold => minerLoader.load(gold.miner_name || ''), // dbGold.getMiner(gold.miner_name),
  },
  Miner: {
    golds: miner => goldsOwnedLoader.load(miner.name || ''), // dbGold.getGoldsOwned(miner.name),
  },
};

module.exports = resolvers;