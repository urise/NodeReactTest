var path = require('path');
var fs = require('fs');
var express = require('express');

// Server part
var app = express();
console.log('__dirname = ' + __dirname);
app.use('/', express.static(path.join(__dirname, 'public')));

var port = 8088;
var server = app.listen(port);
console.log('Server listening on port ' + port);

// Socket.IO part
var io = require('socket.io')(server);

var sendComments = function (socket) {
	fs.readFile('_comments.json', 'utf8', function(err, comments) {
		comments = JSON.parse(comments);
		socket.emit('comments', comments);
	});
};

io.on('connection', function (socket) {
  console.log('New client connected!');
  
  socket.on('fetchComments', function () {
		sendComments(socket);
	});

	socket.on('newComment', function (comment, callback) {
		fs.readFile('_comments.json', 'utf8', function(err, comments) {
			comments = JSON.parse(comments);
			comments.push(comment);
			fs.writeFile('_comments.json', JSON.stringify(comments, null, 4), function (err) {
				io.emit('comments', comments);
				callback(err);
			});
		});
	});
});