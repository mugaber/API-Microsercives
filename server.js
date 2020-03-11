const bodyParser = require('body-parser')
const express = require('express')
const multer = require('multer')
const cors = require('cors')
require('dotenv').config()

const app = express()
const port = 3000

// database config
const mongoose = require('mongoose')
mongoose.connect(process.env.DB_URI, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true
})
const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', function(err, data) {
  if (err) console.log(err)
  console.log('db connected')
})
const UserModel = require('./UserModel')

// middlewares
app.use(cors({ optionsSuccessStatus: 200 }))
app.use(bodyParser.urlencoded({ extended: false }))

// Error Handling middleware
app.use((err, req, res, next) => {
  let errCode, errMessage

  if (err.errors) {
    // mongoose validation error
    errCode = 400 // bad request
    const keys = Object.keys(err.errors)
    // report the first validation error
    errMessage = err.errors[keys[0]].message
  } else {
    // generic or custom error
    errCode = err.status || 500
    errMessage = err.message || 'Internal Server Error'
  }
  res
    .status(errCode)
    .type('txt')
    .send(errMessage)
})

// serving static files
app.use(express.static(__dirname + '/public'))
app.get('/', function(req, res) {
  res.sendFile(__dirname + '/public/index.html')
})

// =================== EXCERCISE TRACKER =======================

/**
 * @function get users
 * @returns all users
 */
app.get('/api/exercise/users', function(req, res) {
  UserModel.find(function(err, coll) {
    if (err) {
      return res.status(500).send(`db error ${err}`)
    }

    return res.status(200).send(coll)
  })
})

/**
 * @function post add new user
 * @returns object username and _id
 */
app.post('/api/exercise/new-user', function(req, res) {
  const username = req.body.username

  if (!username) return res.json({ error: 'username required' })

  // check if the user exists
  UserModel.findOne({ username: username }, function(err, doc) {
    if (err) {
      return res.status(500).send(`db error ${err}`)
    }

    if (doc) return res.json({ error: 'user already exists' })

    // create new user
    const newUser = new UserModel({ username: username })
    newUser.save(function(err, doc) {
      if (err) {
        return res.status(500).send(`db error ${err}`)
      }

      res.status(200).send({ _id: doc._id, username: doc.username })
    })
  })
})

/**
 * @function post add new exercise
 * @returns user object updated
 */
app.post('/api/exercise/add', function(req, res) {
  const formData = req.body
  if (formData.date) formData.date = new Date(formData.date)
  if (!formData.date) formData.date = new Date()

  UserModel.findById(formData.userId, function(err, doc) {
    if (err) {
      return res
        .status(500)
        .send(`db error: ${err} propably invalid userId form`)
    }

    if (!doc) return res.json({ error: 'Invalid userId' })

    doc.log.push({
      description: formData.description,
      duration: formData.duration,
      date: formData.date.toDateString()
    })

    doc.save(function(err, newDoc) {
      if (err) {
        return res.status(500).send(`db error ${err}`)
      }

      return res.send(newDoc)
    })
  })
})

/**
 * @function get exercise log using userid, with optional feilds
 * @returns user object with added info about exercise and constraints
 */
app.get('/api/exercise/log', function(req, res) {
  const { userid, from, to, limit } = req.query

  UserModel.findById(userid, function(err, doc) {
    if (err) {
      return res
        .status(500)
        .send(`db error: ${err}, propably invalid userId form`)
    }

    // invalid userid
    if (!doc) return res.json({ error: 'Invalid userid' })

    let newLog = [...doc.log]
    if (from) newLog = newLog.filter(log => log.date >= from)
    if (to) newLog = newLog.filter(log => log.date < to)
    if (limit) newLog = newLog.slice(0, limit)

    return res.send({
      _id: doc._id,
      username: doc.username,
      log: newLog,
      count: newLog.length
    })
  })
})

// =============================================================

// running the server
app.listen(port, function(req, res) {
  console.log(`Server running on port ${port}`)
})
