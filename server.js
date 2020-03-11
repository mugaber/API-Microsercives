const bodyParser = require('body-parser')
const express = require('express')
const multer = require('multer')
const cors = require('cors')
require('dotenv').config()

const app = express()
const port = 3000

// middlewares
app.use(cors({ optionsSuccessStatus: 200 }))
app.use(bodyParser.urlencoded({ extended: false }))

// serving static files
app.use(express.static(__dirname + '/public'))
app.get('/', function(req, res) {
  res.sendFile(__dirname + '/public/index.html')
})

// =================== UPLOAD FILES =======================

const upload = multer({ dest: 'uploads/' })

app.post('/api/fileanalyse', upload.single('upfile'), function(req, res) {
  const file = req.file
  console.log('upfile', file)
  console.log('body', req.body)

  if (!file) return res.json({ error: 'please upload a file' })

  console.log(file.filename, file.size)

  res.json({ name: file.originalname, size: file.size })
})

// ========================================================

// running the server
app.listen(port, function(req, res) {
  console.log(`Server running on port ${port}`)
})
