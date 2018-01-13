var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);

//soket.io
var http = require('http').Server(app);
var io = require('socket.io')(http);
var POST = 3001;//localhost:3001

//socket.ioに接続された時に動く処理
io.on('connection', function(socket) {
  //接続時に振られた一意のIDをコンソールに表示
  console.log('入室したID : %s', socket.id);

  //接続時に全員にIDを表示（messageというイベントでクライアント側とやりとりする）
  io.emit('message', socket.id + 'さんが入室しました！', 'System');

  //messageイベントで動く
  //全員に取得したメッセージとIDを表示
  socket.on('message', function(msj) {
    io.emit('message', msj, socket.id);
  });

  //接続が切れた時に動く
  //接続が切れたIDを全員に表示
  socket.on('disconnect', function(e) {
    console.log('接続が切れたID : %s', socket.id);
  });
});

//接続待ち状態になる
http.listen(POST, function() {
  console.log('接続開始', POST);
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
