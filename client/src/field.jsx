import React from 'react';
import $ from 'jquery';
import styles from '../dist/main.css';
import socketIOClient from 'socket.io-client'
import Trees from './trees.jsx';

let ground = { 
  position: 'absolute',
  top: '200px',
  left: '0',
  width: '1600px',
  height: '500px',
  'background-image': "url('./img/ground.jpeg')"
}

export default class Field extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      
    }
  }

  componentDidMount() {
    const socket = socketIOClient("http://localhost:7763")

    var movement = {
      up: false,
      down: false,
      left: false,
      right: false
    }
    document.addEventListener('keydown', function(event) {
      switch (event.keyCode) {
        case 65: // A
          movement.left = true;
          break;
        case 87: // W
          movement.up = true;
          break;
        case 68: // D
          movement.right = true;
          break;
        case 83: // S
          movement.down = true;
          break;
      }
    });
    document.addEventListener('keyup', function(event) {
      switch (event.keyCode) {
        case 65: // A
          movement.left = false;
          break;
        case 87: // W
          movement.up = false;
          break;
        case 68: // D
          movement.right = false;
          break;
        case 83: // S
          movement.down = false;
          break;
      }
    });

    socket.emit('player joined');
    setInterval(function() {
      socket.emit('movement', movement);
    }, 1000 / 60);

    var canvas = document.getElementById('players');
    canvas.width = 1600;
    canvas.height = 600;
    var context = canvas.getContext('2d');
    socket.on('state', function(players) {
      context.clearRect(0, 0, 1600, 600);
      context.fillStyle = 'black';
      for (var id in players) {
        var player = players[id];
        context.beginPath();
        context.rect(player.x, player.y, 20, 40);
        context.fill();
      }
    });
  }

  renderHub(){

  }

  render () {
    return (
      <div className={styles.hub}>
        <Trees />
        <div id="ground" style={ground}></div>
        <canvas id="players" className={styles.players}></canvas>
      </div>
    )
  }
}
