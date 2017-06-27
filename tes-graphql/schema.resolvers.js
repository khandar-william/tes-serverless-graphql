const dbSongs = require('./dynamo/songs');
const dbArtists = require('./dynamo/artists');
const dbCrawled = require('./dynamo/crawled');

const resolvers = {
  Query: {
    artists: () => dbArtists.getArtists(),
    artist: (_, args) => dbArtists.getArtistById(args.id),
    songs: () => dbSongs.getSongs(),
    song: (_, args) => dbSongs.getSongById(args.id),
    shows: (_, args) => dbCrawled.listShows(args.limit, args.page),
  },
  Mutation: {
    createArtist: (_, args) => dbArtists.createArtist(args),
    updateArtist: (_, args) => dbArtists.updateArtist(args),
    deleteArtist: (_, args) => dbArtists.deleteArtist(args),
    createSong: (_, args) => dbSongs.createSong(args),
    updateSong: (_, args) => dbSongs.updateSong(args),
    deleteSong: (_, args) => dbSongs.deleteSong(args),
  },
  Artist: {
    songs: artist => dbSongs.getSongsByArtist(artist.id),
  },
  Song: {
    artist: song => dbArtists.getArtistById(song.artist),
  },
};


module.exports = resolvers;