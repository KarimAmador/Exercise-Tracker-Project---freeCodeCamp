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

app.post('/api/users/:_id/exercises', async function(req, res) {
  console.log(req.body);

  try {
    console.log('PARAMS:', req.params);
    let user = await User.findById(req.params._id);

    if (user) {
      user.log.push({
        description: req.body.description,
        duration: Number(req.body.duration),
        date: req.body.date ? new Date(req.body.date).toDateString() : undefined
      })
      
      user.count += 1;
      
      console.log(user);
      
      await user.save();

      res.json({
        username: user.username,
        description: user.log[user.count - 1].description,
        duration: user.log[user.count - 1].duration,
        date: user.log[user.count - 1].date,
        _id: user._id.toString()
      });
    } else {
      throw new Error("User doesn't exist")
    }
  } catch (err) {
    console.error(err)
    res.json({error: err.toString()})
  }
})

app.get('/api/users', async function(req, res) {
  try {
    const users = await User.find({});
    const responseObj = Array.from(users).map(obj => {
      return {username: obj.username, _id: obj._id};
    });
  
    res.json(responseObj);
  } catch (err) {
    console.error(err);
    res.json({error: err.toString().slice(7)});
  }
})

app.get('/api/users/:_id/logs', async function(req, res) {
  console.log(req.params)

  try {
    const userLog = await User.findById(req.params._id);

    res.json({
      username: userLog.username,
      count: userLog.count,
      _id: userLog._id,
      log: userLog.log
    });
  } catch (err) {
    console.error(err);
    res.json({error: err.toString()});
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
