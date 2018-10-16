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

app.get('/monsters', (req, res) => {
  let level = req.query;
  db.getMonsterData(level.level, (err, data) => {
    if (err) { console.log('error getting Monsters!', err) }
    else {
      res.send(data.rows);
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

io.on('connection', (socket) => {
  socket.on('disconnect', () => {
    delete players[socket.id]
  });

  socket.on('player joined', (player) => {
    players[socket.id] = {
      username: player.username,
      class: player.class,
      direction: 'right',
      attacking: false,
      cooldown: 0,
      x: 783,
      y: 320,
      health: 1000,
    }
    console.log(players);
  });

  socket.on('movement', (data) => {
    let player = players[socket.id] || {};
    if (data.left) {
      player.x -= 5;
      player.direction = 'left';
    }
    if (data.up) {
      player.y -= 5;
    }
    if (data.right) {
      player.x += 5;
      player.direction = 'right';
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


  socket.on('basic-attack', (data) => {
    let player = players[socket.id] || {};
    player.attacking = data.basic;
    player.attackD = player.direction;
  });

  setInterval(() => {
    io.sockets.emit('state', players);
  }, 1000 / 100);
});



let port = 7763;
server.listen(port, () => {
  console.log('listening on port' + port);
});

