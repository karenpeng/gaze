var express = require('express');
var app = express();
var server = require('http').Server(app);

var mongoose = require('mongoose');
var config = require('./server/config.json');
var Record = require('./server/model.js');
var bodyParser = require('body-parser');

var port = process.env.PORT || config.port;

var jsonParser = bodyParser.json();
app.use(bodyParser.urlencoded({
  limit: '50mb',
  extended: true
}));

var ejs = require('ejs');
app.set('views', __dirname + '/views');
app.engine('.html', ejs.__express);
app.set('view engine', 'html');
app.use(express.static(__dirname + '/public'));

mongoose.connect(config.db);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback() {
  console.log('yay! database connected');
});

app.get('/', function (req, res) {
  res.render('index.html');
});

app.get('/gallery', function(req, res){
  res.render('gallery.html');
});

app.listen(port, function () {
  console.log('Listening on ' + port);
});

