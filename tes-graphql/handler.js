'use strict';

const fs = require('fs');
const path = require('path');
const request = require('request');
const cheerio = require('cheerio');

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

var makeRequestHandle = function (callback, doSomething) {
  return function (error, response, body) {
    if (error) {
      console.error('Error: ' + error);
      callback(new Error(error), null);
    }

    if (response.statusCode === 200) {
      var $ = cheerio.load(body);
      return doSomething($);
    } else {
      console.error('Got code ' + response.statusCode);
      callback(new Error('Got code ' + response.statusCode), null);
    } 
  };
}

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
        'Access-Control-Allow-Origin': '*',
      },
      statusCode: 200,
      body: JSON.stringify(body)
    }));
};

const crawledDb = require('./dynamo/crawled');

function createVideoUrl(url) {
  // https://video1.break.com/dnet/media/337/031/3031337/watching-thrones-s6-e10-the-winds-of-winter-3264_kbps.mp4?1B608EE7AFCE3765E176F3C6FBB98002B3D18C64572F2307D769A572A676F3BDF079?1B608EE7AFCE3765E176F3C6FBB98002B3D18C64572F2307D769A572A676F2B9C30A
  // "http://www.screenjunkies.com/video/grease-lives-kether-donohue-on-mundy-night-raw-3018787"
  var parsed = url.match(/\/video\/([^\/]+)-((\d{3})\d(\d{3}))$/);

  var title = parsed[1];
  var number = parsed[2];
  var firstHalf = parsed[3];
  var lastHalf = parsed[4];
  return `https://video1.break.com/dnet/media/${lastHalf}/${firstHalf}/${number}/${title}-3264_kbps.mp4?1B608EE7AFCE3765E176F3C6FBB98002B3D18C64572F2307D769A572A676F3BDF079?1B608EE7AFCE3765E176F3C6FBB98002B3D18C64572F2307D769A572A676F2B9C30A`;
}

module.exports.crawl = (event, context, callback) => {
  var urlNow;
  var queuesNow;
  var showsNow;

  crawledDb.getQueues()
  .then((queues) => {
    urlNow = queues.pop();
    queuesNow = queues;
    console.log('After getQueues');
    return crawledDb.getShows();
  })
  .then((shows) => {
    showsNow = shows;
    console.log('After getShows');

    console.log('Visiting ' + urlNow);
    
    request(urlNow, makeRequestHandle(callback, function ($) {
      var result = [];
      $('.EpisodeList-item').each(function () {
        var $this = $(this);
        var parsedItem = {
          title: $this.find('.EpisodeList-episodeTitle').text().trim(),
          url: $this.attr('href'),
          video: createVideoUrl($this.attr('href')),
        };
        console.log('Adding ' + parsedItem.title + ' ' + parsedItem.url);
        result.push(parsedItem);
      });
      console.log('Result count: ' + result.length);

      showsNow = showsNow.concat(result);
      crawledDb.setShows(showsNow)
        .then(() => { return crawledDb.setQueues(queuesNow); })
        .then(() => { callback(null, 'Shows count: ' + showsNow.length); });
    }));
  });

};

module.exports.initQueue = (event, context, callback) => {
  var startHere = 'http://www.screenjunkies.com/shows';
  console.log('Visit ' + startHere);

  request(startHere, makeRequestHandle(callback, function ($) {
    var result = [];
    $('.PlugItem').each(function () {
      result.push($(this).attr('href'));
    });
    crawledDb.setQueues(result).then(() => { console.log('Queue count: ' + result.length); });
  }));
};

const configuraDb = require('./dynamo/configura');

module.exports.configura = (event, context, callback) => {
  var command = event;
  console.log('Body is ' + command);

  var parsed;
  if (parsed = command.match(/^get:([^:]+)$/)) {
    var configKey = parsed[1];
    configuraDb.getConfig(configKey)
      .then((val) => callback(null, val));
  } else if (parsed = command.match(/^set:([^:]+):([^:]+)$/)) {
    var configKey = parsed[1];
    var configVal = parsed[2];
    configuraDb.setConfig(configKey, configVal)
      .then(() => callback(null, configKey + ' = ' + configVal));
  } else {
    console.error('Command unrecognized');
    callback(new Error('Command unrecognized'));
  }
};