const bodyParser = require('body-parser')
const express = require('express')
const cors = require('cors')
const dns = require('dns')
require('dotenv').config()

const mongoose = require('mongoose')
mongoose.connect(process.env.DB_URI, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true
})

const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error'))
db.once('open', () => console.log('db connected'))
const UrlModel = require('./UrlModel')

const app = express()
const port = 3000

// middlewares
app.use(cors({ optionsSuccessStatus: 200 }))
app.use(bodyParser.urlencoded({ extended: false }))

// sending files
app.use(express.static(__dirname + '/public'))
app.get('/', function(req, res) {
  res.sendFile(__dirname + '/public/index.html')
})

//=============================================================

// create new url document

app.post('/api/shorturl/new', async function(req, res, next) {
  try {
    const orgUrl = req.body.url
    let shortUrl

    // validate the url
    const regex = /^http(s)?:\/\/(www\.)[-a-zA-Z0-9@:%._\+~#=]{1,256}\.com$/
    if (!orgUrl.match(regex)) {
      return res.json({ error: 'invalid URL' })
    }

    UrlModel.find(async function(err, collection) {
      if (err) return console.log('db error', err)

      console.log('url documents\n', collection)

      // if this is the first url
      if (!collection.length) {
        shortUrl = 0
        const newUrl = new UrlModel({ url: orgUrl, shortUrl: shortUrl })

        try {
          await newUrl.save(function(err, doc) {
            console.log('if this is the first url')

            if (err) return console.log('db error', err)

            return res.json({ original_url: doc.url, short_url: doc.shortUrl })
          })
        } catch (error) {
          console.log('error in first doc')
          return res.send('error first url')
        }
      }

      // if the url already saved
      try {
        await UrlModel.findOne({ url: orgUrl }, function(err, doc) {
          console.log('if the url already saved')

          if (err) return console.log('db error', err)

          if (doc)
            return res.json({ original_url: doc.url, short_url: doc.shortUrl })
        })
      } catch (error) {
        console.log('error finding doc')
        return res.send('error url already saved')
      }

      // if url does not exist
      try {
        shortUrl = collection[collection.length - 1].shortUrl + 1
        const newUrl = new UrlModel({ url: orgUrl, shortUrl: shortUrl })

        await newUrl.save(function(err, doc) {
          console.log('url does not exist')

          if (err) return console.log(err)

          return res.json({ original_url: doc.url, short_url: doc.shortUrl })
        })
      } catch (error) {
        return res.send('error url does not exist')
      }
    })
  } catch (error) {
    next(error)
  }
})

// redirect to original url
app.get(
  '/api/shorturl/:shortUrl',

  function(req, res, next) {
    const shortUrl = req.params.shortUrl

    UrlModel.findOne({ shortUrl: parseInt(shortUrl) }, function(err, doc) {
      if (err) {
        console.log(err)
        return res.send('error retreiving')
      }

      if (doc) return res.redirect(doc.url)

      next()
    })
  },

  function(req, res) {
    res.json({ error: 'Invalid short_url' })
  }
)

//==============================================================

app.listen(port, function(req, res) {
  console.log(`Server running on port ${port}`)
})
