import React from 'react';
import $ from 'jquery';
import styles from '../dist/main.css';

export default class Trees extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      portalFrame: 0,
    }
  }

  componentDidMount() {
    let move = 600;
    let branchW = 7;
    let len = 60;
    let forest = 0;
    let posneg;
    
    let drawTree = ( startX, startY, length, angle, depth, branchWidth, color1, color2) => {
      let canvas = document.getElementById('canvas');
      let ctx = canvas.getContext('2d');
      let rand = Math.random;
      let newLength, newAngle, newDepth, maxBranch = 3,
          endX, endY, maxAngle = 2 * Math.PI / 6, subBranches;

      ctx.beginPath();
      ctx.moveTo(startX, startY);
      endX = startX + length * Math.cos(angle);
      endY = startY + length * Math.sin(angle);
      ctx.lineCap = 'round';
      ctx.lineWidth = branchWidth;
      ctx.lineTo(endX, endY);

      if (depth <= 2) {
        ctx.strokeStyle = color1;
      }
      else {
        ctx.strokeStyle = color2;
      }
      ctx.stroke();
      newDepth = depth - 1;

      if(!newDepth) {
        return;
      }
      subBranches = (rand() * (maxBranch - 1)) + 1;
      branchWidth *= 0.7;

      for (let i = 0; i < subBranches; i++) {
        newAngle = angle + rand() * maxAngle - maxAngle * 0.5;
        newLength = length * (0.7 + rand() * 0.3);
        drawTree(endX, endY, newLength, newAngle, newDepth, branchWidth, color1, color2);
      }

    }
    // drawTree( 400, 900, 60, -Math.PI / 2, 12, 7)
    setInterval(()=>{
      let c1 = 'rgb(0,' + (((Math.random() * 64) + 150) >> 0) + ',0)';
      let c2 = 'rgb(96, 60, 20)';
      posneg = Math.random() < 0.5 ? -1 : 1
      move +=  posneg * Math.random()* 500;
      if (move < 0 ) {
        move = 600;
      }
      if (move > 1600) {
        move = 300;
      }
      branchW = Math.random() * 8;
      len = Math.random() * 30;
      if (len < 40) {
        branchW = Math.random() * 2;
      }
      if (forest > 50 && forest < 101) {
        c1 = 'rgb(243, 188, 46)';
      }
      if (forest > 100 && forest < 151) {
        c1 = 'rgb(212, 91, 18)';
      }
      if (forest > 150 && forest < 171) {
        c1 = 'rgb(156, 39, 6)';
      }
      if (forest > 170 && forest < 251) {
        c1 = 'rgb(227, 227, 220)';
      }
      if (forest > 250) {
        forest = 0;
      }
      drawTree( move, 200, len, -Math.PI / 2, 10, branchW, c1, c2);
      forest++;
    }, 1000);

    let portal = document.getElementById('portal').getContext('2d');
    let portalImage = new Image();
    portalImage.src = './img/portal.png';
    setInterval(() => {
      portal.clearRect(0, 0, 200, 200);
      portal.beginPath();
      portal.drawImage(portalImage, this.state.portalFrame * 200, 0, 200, 200, 0, 0, 200, 200);
      portal.fill();
      this.setState({
        portalFrame: this.state.portalFrame + 1
      });
      if (this.state.portalFrame >= 5) {
        this.setState({
          portalFrame: 0
        });
      }
    }, 1000/5);
  }

  render () {
    return (
      <div>
        <canvas id="canvas" className={styles.trees} width="1600" height="200"></canvas>
        <div className={styles.sign}><img height="102px" src="./img/sign.png"></img></div>
        <div className={styles.portal}><canvas id="portal" width="200" height="200"></canvas></div>
        {this.props.gameState >= 4  ? 
        <div id="shop" className={styles.shop} height="200px"><img height="200px" src="./img/store2.png"></img></div>:
        <div id="shop" className={styles.shop} height="200px"><img height="200px" src="./img/store.png"></img></div>
        }
      </div>
    )
  }

}