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
app.use(function(req, res, next) {
  console.log(`${req.method} ${req.path} - ${req.ip}`);
  next();
});

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
    res.json({error: err.message});
  }
})

app.post('/api/users/:_id/exercises', async function(req, res) {
  console.log(req.body, req.params);

  try {
    let user = await User.findById(req.params._id);

    if (user) {
      user.log.unshift({
        description: req.body.description,
        duration: Number(req.body.duration),
        date: req.body.date ? new Date(req.body.date).toDateString() : undefined
      })

      user.log.sort((a, b) => new Date(b.date) - new Date(a.date));
      
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
    res.json({error: err.message});
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
    res.json({error: err.message});
  }
})

app.get('/api/users/:_id/logs', async function(req, res) {
  console.log(req.params, req.query)

  try {
    const userLog = await User.findById(req.params._id);
    
    if (!userLog) {
      throw new Error('User not found');
    }

    let newLog = userLog.log;
    
    newLog = newLog.slice(
      req.query.to ? newLog.findIndex((item) => new Date(item.date) <= new Date(req.query.to)) : 0,
      req.query.from ? newLog.findLastIndex((item) => new Date(item.date) >= new Date(req.query.from)) + 1 : undefined
    );

    if (req.query.limit) newLog = newLog.slice(0, Math.abs(Number(req.query.limit)) - 1 < 0 ? undefined : Math.abs(Number(req.query.limit)));

    res.json({
      username: userLog.username,
      count: userLog.count,
      _id: userLog._id,
      log: newLog
    });
  } catch (err) {
    console.error(err);
    res.json({error: err.message});
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
