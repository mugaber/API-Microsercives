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

// request header parser
app.get('/api/whoami', function(req, res) {
  res.json({
    ipaddress: req.headers.host,
    language: req.headers['accept-language'],
    software: req.headers['user-agent']
  })
})

app.listen(port, function(req, res) {
  console.log(`Server running on port ${port}`)
})
