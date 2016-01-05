fetch = require 'node-fetch'

module.exports = (callback) ->
  tagsJson = process.env.BBN_ENTRIES_TAGS ? '[]'
  tags = JSON.parse tagsJson
  fetch 'http://blog.bouzuya.net/posts.json'
  .then (res) ->
    res.json()
  .then (posts) ->
    year = new Date(new Date().getTime() - 24 * 60 * 60 * 1000).getYear() + 1900
    posts.filter (i) -> i.pubdate.match(new RegExp('^' + year))
  .then (posts) ->
    tags
    .map (tag) ->
      { tag, count: posts.filter((i) -> i.tags.some((j) -> j is tag)).length }
    .concat
      tag: 'all'
      count: posts.length
  .then (counts) ->
    result = {}
    counts.forEach ({ tag, count }) ->
      result['bbn-entries-' + tag.replace(/ /g, '-')] = count
    result
  .then ((result) -> callback(null, result)), callback
