var g = require('graphql');

function mockArtist() {
  return {
    id: 'ID ARTIST',
    first_name: 'FIRST NAME ARTIST',
    last_name: 'LAST NAME ARTIST',
  };
}

function mockSong() {
  return {
    id: 'ID SONG',
    title: 'TITLE SONG',
    duration: 99,
  };
}

var ArtistType = new g.GraphQLObjectType({
  name: 'Artist',
  fields: () => ({
    id: { type: new g.GraphQLNonNull(g.GraphQLID) },
    first_name: { type: g.GraphQLString },
    last_name: { type: g.GraphQLString },
    songs: { 
      type: new g.GraphQLList(SongType),
      resolve: obj => [mockSong()],
    },
  })
});

var SongType = new g.GraphQLObjectType({
  name: 'Song',
  fields: () => ({
    id: { type: new g.GraphQLNonNull(g.GraphQLID) },
    title: { type: g.GraphQLString },
    duration: { type: g.GraphQLInt },
    artist: { 
      type: ArtistType,
      resolve: obj => mockArtist(),
    },
  })
});

var QueryType = new g.GraphQLObjectType({
  name: 'Query',
  fields: {
    artists: {
      type: new g.GraphQLList(ArtistType),
      resolve: function (_, args) {
        return [mockArtist()];
      },
    },
    artist: {
      type: ArtistType,
      args: {
        id: { type: new g.GraphQLNonNull(g.GraphQLID) },
      },
      resolve: function (_, args) {
        return mockArtist();
      },
    },
    songs: {
      type: new g.GraphQLList(SongType),
      resolve: function (_, args) {
        return [mockSong()];
      },
    },
    song: {
      type: SongType,
      args: {
        id: { type: new g.GraphQLNonNull(g.GraphQLID) },
      },
      resolve: function (_, args) {
        return mockSong();
      },
    },
  },
});

var MutationType = new g.GraphQLObjectType({
  name: 'Mutation',
  fields: {
    createArtist: {
      type: ArtistType,
      args: {
        first_name: { type: new g.GraphQLNonNull(g.GraphQLString) },
        last_name: { type: new g.GraphQLNonNull(g.GraphQLString) },
      },
      resolve: function (_, args) {
        return mockArtist();
      },
    },
    deleteArtist: {
      type: ArtistType,
      args: {
        id: { type: new g.GraphQLNonNull(g.GraphQLID) },
      },
      resolve: function (_, args) {
        return mockArtist();
      },
    },
    createSong: {
      type: SongType,
      args: {
        title: { type: new g.GraphQLNonNull(g.GraphQLString) },
        artist: { type: new g.GraphQLNonNull(g.GraphQLString) },
        duration: { type: new g.GraphQLNonNull(g.GraphQLInt) },
      },
      resolve: function (_, args) {
        return mockSong();
      },
    },
    deleteSong: {
      type: SongType,
      args: {
        id: { type: new g.GraphQLNonNull(g.GraphQLID) },
      },
      resolve: function (_, args) {
        return mockSong();
      },
    },
  },
});

var schema = new g.GraphQLSchema({
  query: QueryType,
  mutation: MutationType,
});
module.exports = schema;