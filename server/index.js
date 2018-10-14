const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const bodyParser = require('body-parser');
const db = require('../database/index.js');

let app = express();
let server = http.Server(app);
let io = socketIO(server);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/', express.static('./client/dist'));

app.get('/login', (req, res)=> {
  let user = req.query;
  console.log(req.query)
  db.getUserData(user, (err, data) =>{
    if (err) { console.log('errored! ', err) }
    else {
      res.send(data);
    }
  });
});

app.post('/createUser', (req, res) => {
  let user = req.body
  db.addNewUser(user, (err, data) => {
    if (err) { console.log('error! ', err) }
    else {
      res.send(data);
    }
  });
});

let players = {};
io.on('connection', function (socket) {

  socket.on('player joined', () => {
    players[socket.id] = {
      x: 300,
      y: 500
    }
    console.log(players);
  });

  socket.on('movement', (data) => {
    let player = players[socket.id] || {};
    if (data.left) {
      player.x -= 5;
    }
    if (data.up) {
      player.y -= 5;
    }
    if (data.right) {
      player.x += 5;
    }
    if (data.down) {
      player.y += 5;
    }
    if (player.x < 0) {
      player.x = 0;
    }
    if (player.x > 1580) {
      player.x = 1580;
    }
    if (player.y < 160) {
      player.y = 160;
    }
    if (player.y > 560) {
      player.y = 560;
    }
  });

  setInterval(function() {
    io.sockets.emit('state', players);
  }, 1000 / 60);
});



let port = 7763;
server.listen(port, () => {
  console.log('listening on port' + port);
});

