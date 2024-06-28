const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser')
const { default: mongoose } = require('mongoose')
const connectDB = require('./db/connect')
const User = require('./models/user')
require('dotenv').config()

app.use(cors())
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: false }))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.post('/api/users', async function(req, res) {
  console.log(req.body);

  try {
    let user = await User.findOne({ username: req.body.username })

    if (!user) {
      user = new User({
        username: req.body.username
      })
    }
    
    await user.save()

    res.json({
      username: user.username,
      _id: user._id.toString()
    });
  } catch (err) {
    console.error(err)
    return res.json({error: err.toString().slice(7)})
  }
})

async function start() {
  try {
    await connectDB();
    const listener = app.listen(process.env.PORT || 3000, () => {
      console.log('Your app is listening on port ' + listener.address().port)
    })
  } catch (err) {
    console.log(err);
  }
}

start()
