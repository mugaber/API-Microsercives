const mongoose = require('mongoose')
const Schema = mongoose.Schema

const UrlSchema = new Schema({
  url: { type: String, required: true, unique: true },
  shortUrl: { type: Number, required: true, unique: true }
})

module.exports = mongoose.model('Url', UrlSchema)
