var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

var mongoose = require('mongoose');
var config = require('./server/config.json');
var Record = require('./server/model.js');

var bodyParser = require('body-parser');

var port = process.env.PORT || config.port;

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({
  limit: '50mb',
  extended: true,
  parameterLimit: 10000
}));
// create application/json parser
app.use(bodyParser.json({
  limit: '50mb'
}));

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.static(__dirname + '/public'));

mongoose.connect(config.db);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback() {
  console.log('yay! database connected');
});

app.get('/', function (req, res) {
  res.render('index.jade');
});

app.get('/previous', function (req, res) {
  var query = {};
  var selet = 'eye';
  var option = {
    limit: 1,
    sort: {
      "date": -1
    }
  };
  Record.findOne(query, selet, option, function (err, data) {
    if (err) {
      return console.error(err);
    }
    res.send(data);
  });
});

app.post('/upload', function (req, res) {
  var record = new Record();
  record.eye = req.body.eye;
  record.save();
  res.send('saved:)');
});

app.get('/gallery', function (req, res) {
  res.render('gallery.jade');
});

function turnPage(num) {
  var query = {};
  var selet = 'eye';
  var option = {
    skip: num,
    limit: 2,
    sort: {
      "date": -1
    }
  };
  return Record.findOne(query, selet, option, function (err, data) {
    if (err) {
      return console.error(err);
    }
    return data;
  });
}

io.on('connection', function (socket) {
  socket.emit('hello');

  function sendEyes(num) {
    var query = {};
    var selet = 'eye';
    var option = {
      skip: num,
      limit: 1,
      sort: {
        "date": -1
      }
    };
    Record.findOne(query, selet, option, function (err, data) {
      if (err) {
        return console.error(err);
      }
      socket.emit('data', data);
      num++;
      console.log('sent ' + num + ' ' + data);
      if (data === null) return;
      setTimeout(function () {
        sendEyes(num);
      }, 3000);

    });
  }

  socket.on('request', function () {
    sendEyes(0);
  });
});

server.listen(port, function () {
  console.log('Listening on ' + port);
});