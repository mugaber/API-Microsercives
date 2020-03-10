const express = require('express')
const cors = require('cors')

const app = express()
const port = 3000

// middlewares
app.use(cors({ optionsSuccessStatus: 200 }))

// sending files
app.use(express.static(__dirname + '/public'))
app.get('/', function(req, res) {
  res.sendFile(__dirname + '/public/index.html')
})

// timestamp microservice
app.get('/api/timestamp/:date_string?', function(req, res) {
  const dateString = req.params.date_string
  let timestamp
  let error

  if (!dateString) {
    timestamp = new Date()
  } else if (dateString.match(/^\d{4}\-\d{2}\-\d{2}$/)) {
    timestamp = new Date(dateString)
    res.json({ unix: timestamp.getTime(), utc: timestamp.toUTCString() })
  } else if (parseInt(dateString)) {
    timestamp = new Date(parseInt(dateString))
  } else {
    res.json({ error: 'Invalid Date' })
  }

  res.json({ unix: timestamp.getTime(), utc: timestamp.toUTCString() })
})

app.listen(port, function(req, res) {
  console.log(`Server running on port ${port}`)
})
