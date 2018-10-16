import React from 'react';
import $ from 'jquery';
import _ from 'underscore';
import styles from '../dist/main.css';
import socketIOClient from 'socket.io-client'
import Trees from './trees.jsx';

export default class Field extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      once: true,
      init: 1,
      level: 1,
      players: [],
      playersList: [],
      monsters: [],
      monsterList: [],
      monstersImages: {},
      monFrame1: 0,
      monTickPerFrame1: 4,
      monFrame2: 0,
      monTickPerFrame2: 9,
      frame: 0,
      tickPerFrame: 9,
      attacks: [],
      attacksImages: [],
      attackRate: 100,
      cooldown: 0,
      finalBoss: 0,
      gameState: 0,
      easymode: false,
      aSize: false,
      ground: {
        position: 'absolute',
        top: '200px',
        left: '0',
        width: '1600px',
        height: '500px',
        'background-image': "url('./img/ground2.jpeg')"
      }
    }

    this.listParty = this.listParty.bind(this);
    this.animatePlayer = this.animatePlayer.bind(this);
    this.animateMonsters = this.animateMonsters.bind(this);
    this.animateAttacks = this.animateAttacks.bind(this);
    this.createImages = this.createImages.bind(this);
    this.createMonsters = this.createMonsters.bind(this);
    this.collisionDetect = this.collisionDetect.bind(this);
    this.generateAttacks = this.generateAttacks.bind(this);
    this.ready = this.ready.bind(this);
    this.gameState = this.gameState.bind(this);
    this.nextLevel = this.nextLevel.bind(this);
    this.easyMode = this.easyMode.bind(this); 
    this.increaseSize = this.increaseSize.bind(this);
    this.rapidFire = this.rapidFire.bind(this);
    this.normalFire = this.normalFire.bind(this);
  }

  componentDidMount() {
    let classSprite = {}
    let attacksSprite = {};
    let monstersSprite = {};
    this.createImages(classSprite, attacksSprite, monstersSprite);

    const socket = socketIOClient("http://localhost:7763")


    let movement = {
      up: false,
      down: false,
      left: false,
      right: false
    };
    let attacks = {
      basic: false,
    };

    document.addEventListener('keydown', (event) => {
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
        case 0: //L mouse
            attacks.basic = true;
          break;
        case 32: //Space
            attacks.basic = true;
          break;
      }
    });
    document.addEventListener('keyup', (event) => {
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
        case 0: //L mouse
          attacks.basic = false;
          break;
        case 32: //Space
          attacks.basic = false; 
          break;
      }
    });

    setInterval(() => {
      socket.emit('basic-attack', attacks);
    }, 1000/100)

    socket.emit('player joined', this.props.player);

    setInterval(() => {
      socket.emit('movement', movement);
    }, 1000 / 60);

    setInterval(() => {
      let newFrame = this.state.frame + 1;
      if (newFrame >= this.state.tickPerFrame) {
        newFrame = 0;
      }
      this.setState({
        frame: newFrame,
      });
    }, 1000/10);

    setInterval(() => {
      this.animateAttacks();
    }, 1000/60);


    setInterval(() => {
      let monsterFrame1 = this.state.monFrame1 + 1;
      if (monsterFrame1 >= this.state.monTickPerFrame1) {
        monsterFrame1 = 0;
      }
      this.setState({
        monFrame1: monsterFrame1,
      });
    }, 1000/10);

    setInterval(() => {
      let monsterFrame2 = this.state.monFrame2 + 1;
      if (monsterFrame2 >= this.state.monTickPerFrame2) {
        monsterFrame2 = 0;
      }
      this.setState({
        monFrame2: monsterFrame2,
      });
    }, 1000);

    setInterval(() => {
      this.generateAttacks();
    }, 1000/500)

    setInterval(() => {
      let newBossRender = this.state.finalBoss + 1;
      if (newBossRender > 18) {
        newBossRender = 0;
      }
      this.setState({
        finalBoss: newBossRender
      });
    }, 1000/10);

    this.animatePlayer(socket, classSprite);
  }

  ready(sec) {
    let count = sec || 2  ;
    let counter =  setInterval(() => {
      count = count - 1;
      if (count <= 0) {
        clearInterval(counter);
        this.setState({
          gameState: this.state.gameState + 1
        }, ()=> {
          this.gameState();
        });
      }
    }, 1000);
  }

  gameState() {
    if(this.state.gameState === 1) {
      this.createMonsters(20);
    }

    if(this.state.gameState === 2) {
      this.createMonsters(30);
    }

    if(this.state.gameState === 3) {
      this.createMonsters(40);
    }

    if(this.state.gameState === 4) {
      this.createMonsters(40);
    }

    if(this.state.gameState === 5) {
      //LOOT
    }
  }

  nextLevel() {
      if(this.state.monsterList.length === 0 ){
        this.ready(5);
      }
  }

  createImages(classSprite, attacksSprite, monstersSprite) {
    classSprite.wizard = new Image();
    classSprite.wizard.src = "./img/Wizard_Run.png";
    classSprite.rogue = new Image();
    classSprite.rogue.src = "./img/Rogue_Run.png";
    classSprite.knight = new Image();
    classSprite.knight.src = "./img/Templar_Run.png";
    classSprite.wizardB = new Image();
    classSprite.wizardB.src = "./img/Wizard_Run_Back.png";
    classSprite.rogueB = new Image();
    classSprite.rogueB.src = "./img/Rogue_Run_Back.png";
    classSprite.knightB = new Image();
    classSprite.knightB.src = "./img/Templar_Run_Back.png";

    attacksSprite.wizard = new Image();
    attacksSprite.wizard.src = "./img/Wizard_Fireball.png";
    attacksSprite.wizardB = new Image();
    attacksSprite.wizardB.src = "./img/Wizard_Fireball_Back.png";

    monstersSprite.mon = new Image();
    monstersSprite.mon.src = "./img/Mon_Move.png";
    monstersSprite.monB = new Image();
    monstersSprite.monB.src = "./img/Mon_Move_Back.png";
    monstersSprite.mon1 = new Image();
    monstersSprite.mon1.src = "./img/Mon1_Run.png";
    monstersSprite.mon1B = new Image();
    monstersSprite.mon1B.src = "./img/Mon1_Run_Back.png";
    monstersSprite.mon2 = new Image();
    monstersSprite.mon2.src = "./img/Mon2_Run.png";
    monstersSprite.mon2B = new Image();
    monstersSprite.mon2B.src = "./img/Mon2_Run_Back.png";

    monstersSprite.final0 = new Image();
    monstersSprite.final0.src = "./img/sorcerer attack_Animation 1_0.png";
    monstersSprite.final1 = new Image();
    monstersSprite.final1.src = "./img/sorcerer attack_Animation 1_1.png";
    monstersSprite.final2 = new Image();
    monstersSprite.final2.src = "./img/sorcerer attack_Animation 1_2.png";
    monstersSprite.final3 = new Image();
    monstersSprite.final3.src = "./img/sorcerer attack_Animation 1_3.png";
    monstersSprite.final4 = new Image();
    monstersSprite.final4.src = "./img/sorcerer attack_Animation 1_4.png";
    monstersSprite.final5 = new Image();
    monstersSprite.final5.src = "./img/sorcerer attack_Animation 1_5.png";
    monstersSprite.final6 = new Image();
    monstersSprite.final6.src = "./img/sorcerer attack_Animation 1_6.png";
    monstersSprite.final7 = new Image();
    monstersSprite.final7.src = "./img/sorcerer attack_Animation 1_7.png";
    monstersSprite.final8 = new Image();
    monstersSprite.final8.src = "./img/sorcerer attack_Animation 1_8.png";
    monstersSprite.final9 = new Image();
    monstersSprite.final9.src = "./img/sorcerer attack_Animation 1_9.png";
    monstersSprite.final10 = new Image();
    monstersSprite.final10.src = "./img/sorcerer attack_Animation 1_10.png";
    monstersSprite.final11 = new Image();
    monstersSprite.final11.src = "./img/sorcerer attack_Animation 1_11.png";
    monstersSprite.final12 = new Image();
    monstersSprite.final12.src = "./img/sorcerer attack_Animation 1_12.png";
    monstersSprite.final13 = new Image();
    monstersSprite.final13.src = "./img/sorcerer attack_Animation 1_13.png";
    monstersSprite.final14 = new Image();
    monstersSprite.final14.src = "./img/sorcerer attack_Animation 1_14.png";
    monstersSprite.final15 = new Image();
    monstersSprite.final15.src = "./img/sorcerer attack_Animation 1_15.png";
    monstersSprite.final16 = new Image();
    monstersSprite.final16.src = "./img/sorcerer attack_Animation 1_16.png";
    monstersSprite.final17 = new Image();
    monstersSprite.final17.src = "./img/sorcerer attack_Animation 1_17.png";
    monstersSprite.final18 = new Image();
    monstersSprite.final18.src = "./img/sorcerer attack_Animation 1_18.png";

    monstersSprite.finalB0 = new Image();
    monstersSprite.finalB0.src = "./img/sorcerer attack_Animation 1_0B.png";
    monstersSprite.finalB1 = new Image();
    monstersSprite.finalB1.src = "./img/sorcerer attack_Animation 1_1B.png";
    monstersSprite.finalB2 = new Image();
    monstersSprite.finalB2.src = "./img/sorcerer attack_Animation 1_2B.png";
    monstersSprite.finalB3 = new Image();
    monstersSprite.finalB3.src = "./img/sorcerer attack_Animation 1_3B.png";
    monstersSprite.finalB4 = new Image();
    monstersSprite.finalB4.src = "./img/sorcerer attack_Animation 1_4B.png";
    monstersSprite.finalB5 = new Image();
    monstersSprite.finalB5.src = "./img/sorcerer attack_Animation 1_5B.png";
    monstersSprite.finalB6 = new Image();
    monstersSprite.finalB6.src = "./img/sorcerer attack_Animation 1_6B.png";
    monstersSprite.finalB7 = new Image();
    monstersSprite.finalB7.src = "./img/sorcerer attack_Animation 1_7B.png";
    monstersSprite.finalB8 = new Image();
    monstersSprite.finalB8.src = "./img/sorcerer attack_Animation 1_8B.png";
    monstersSprite.finalB9 = new Image();
    monstersSprite.finalB9.src = "./img/sorcerer attack_Animation 1_9B.png";
    monstersSprite.finalB10 = new Image();
    monstersSprite.finalB10.src = "./img/sorcerer attack_Animation 1_10B.png";
    monstersSprite.finalB11 = new Image();
    monstersSprite.finalB11.src = "./img/sorcerer attack_Animation 1_11B.png";
    monstersSprite.finalB12 = new Image();
    monstersSprite.finalB12.src = "./img/sorcerer attack_Animation 1_12B.png";
    monstersSprite.finalB13 = new Image();
    monstersSprite.finalB13.src = "./img/sorcerer attack_Animation 1_13B.png";
    monstersSprite.finalB14 = new Image();
    monstersSprite.finalB14.src = "./img/sorcerer attack_Animation 1_14B.png";
    monstersSprite.finalB15 = new Image();
    monstersSprite.finalB15.src = "./img/sorcerer attack_Animation 1_15B.png";
    monstersSprite.finalB16 = new Image();
    monstersSprite.finalB16.src = "./img/sorcerer attack_Animation 1_16B.png";
    monstersSprite.finalB17 = new Image();
    monstersSprite.finalB17.src = "./img/sorcerer attack_Animation 1_17B.png";
    monstersSprite.finalB18 = new Image();
    monstersSprite.finalB18.src = "./img/sorcerer attack_Animation 1_18B.png";
    
    this.setState({
      monstersImages: monstersSprite
    });
    this.setState({
      attacksImages: attacksSprite
    });
  }

  animatePlayer(socket, classSprite) {
    let canvas = document.getElementById('players');
    canvas.width = 1600;
    canvas.height = 600;
    let ctx = canvas.getContext('2d');
    socket.on('state', (players) => {
      ctx.clearRect(0, 0, 1600, 600);
      this.listParty(players);
      for (let id in players) {
        let player = players[id];
        let clas = player.class;
        ctx.beginPath();
        if(player.direction === 'left') {
          clas += 'B'
          player.x -= 40;
          ctx.drawImage(classSprite[clas], (8-this.state.frame)*90, 0, 90, 60, player.x, player.y, 90, 60);
        } else {
          ctx.drawImage(classSprite[clas], this.state.frame*90, 0, 90, 60, player.x, player.y, 90, 60);
        }
        
        this.setState({
          playersList: players
        });
      }
      ctx.fill();
    });
  }

  generateAttacks() {
    let players = this.state.playersList;
    for (let id in players) {
      let player = players[id];
      let clas = player.class;
      if (this.state.cooldown < this.state.attackRate) {
        this.setState({
          cooldown: this.state.cooldown + 1
        });
      }
      if (player.attacking && this.state.cooldown >= this.state.attackRate) {
        let currentAttack = [
          {
            class: clas,
            x: player.x + 5,
            y: player.y,
            width: 20,
            length: 10,
            direction: player.attackD,
            travel: 0
          }
        ]
        let attackAnimated = this.state.attacks.concat(currentAttack);
        this.setState({
          attacks: attackAnimated,
          cooldown: 0
        });
      }
    }
  }

  animateAttacks() {
    let attacksSprite = this.state.attacksImages;
    let canvas = document.getElementById('attacks');
    canvas.width = 1600;
    canvas.height = 600;
    let ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 1600, 600);
    ctx.beginPath();
    for (let i = 0; i < this.state.attacks.length; i++){
      let thisAttack = this.state.attacks[i];
      let attackList = this.state.attacks.slice();
      if (thisAttack.travel < 250){
        if (thisAttack.direction === 'right'){
          let currentX = thisAttack.x + 5;
          ctx.drawImage(attacksSprite[thisAttack.class], 0, 0, 50, 25, currentX , thisAttack.y, 50, 25);
          attackList[i].x = currentX;
          this.setState({
            attacks: attackList
          }, () => {
            thisAttack = this.state.attacks[i];
          });
        } else {
          let currentX = thisAttack.x - 5;
          ctx.drawImage(attacksSprite[thisAttack.class + 'B'], 0, 0, 50, 25, currentX, thisAttack.y, 50, 25);
          attackList[i].x = currentX;
          this.setState({
            attacks: attackList
          }, () => {
            thisAttack = this.state.attacks[i];
          });
        }
        attackList[i].travel += 1;
        this.setState({
          attacks: attackList
        });
      } else {
        let attackList = this.state.attacks.slice(0, i).concat(this.state.attacks.slice(i+1, this.state.attacks.length));
        this.setState({
          attacks: attackList
        });
      }
    }
    ctx.fill();
  }

  animateMonsters(num){
    let monsterList = [];
    let amount = Math.floor(Math.random()*35 +num)
    for(let j = 0; j < amount; j++){
      let mon = Object.assign({}, this.state.monsters[Math.floor(Math.random()*this.state.monsters.length)]);
      if (this.state.gameState === 4) {
        mon = Object.assign({}, this.state.monsters[Math.floor(Math.random()*this.state.monsters.length-1)]);
      }
      mon.y = Math.floor(Math.random()*400 + 160);
      mon.x = 1520;
      mon.dead = false;
      mon.travel = 0;
      mon.direction = 'left';
      monsterList.push(mon);
      if(j+1 === amount ) {
        console.log(monsterList)
        this.setState({
          monsterList: monsterList
        })
      }
    }
    if (this.state.gameState === 4) {
      let boss = Object.assign({}, this.state.monsters[3]);
      boss.y = -10;
      boss.x = 1200;
      boss.dead = false;
      boss.travel = 0;
      boss.direction = 'left';
      let newMonList = this.state.monsterList.concat(boss);
      this.setState({
        monsterList: newMonList
      })
    }


    let canvas = document.getElementById('monsters');
    canvas.width = 1600;
    canvas.height = 600;
    let ctx = canvas.getContext('2d');
    setInterval(() => {
      ctx.clearRect(0, 0, 1600, 600);
      ctx.beginPath();
      for (let i = 0; i < this.state.monsterList.length; i++) {
        let random = (num) => { return Math.floor(Math.random()*num)};
        let random1 = () => { return Math.floor(Math.random()*3)};
        let random2 = () => { return Math.floor(Math.random()*4)};
        let random3 = () => { return Math.floor(Math.random()*3)};
        let random4 = () => { return Math.floor(Math.random()*2)};
        var plusOrMinus = () => { return Math.random() < 0.5 ? -1 : 1};
        let newMonsterList = this.state.monsterList.slice();
        let monster = newMonsterList[i];
        let monsterImages = this.state.monstersImages;
        if (monster !== undefined) {
          if(monster.travel < 200 ) {
            monster.travel++;
            if (monster.y <= 200) {
              monster.y = 203;
            }
            if (monster.y >= 610) {
              monster.y = 608;
            }
            if (monster.monsterid === 1) {
              monster.y += random3() * plusOrMinus();
              if (monster.x <= 0) {
                monster.direction = 'right';
              }
              if (monster.x >= 1600) {
                monster.direction = 'left';
              }
              if (monster.direction === 'left') {
                monster.x -= random1();
                ctx.drawImage(monsterImages.mon, this.state.monFrame1*30, 0, 30, 59, monster.x, monster.y, 30, 59);
              } else {
                monster.x += random1();
                ctx.drawImage(monsterImages.monB, this.state.monFrame1*30, 0, 30, 59, monster.x, monster.y, 30, 59);
              }
            }
            if (monster.monsterid === 2) {
              monster.y += random3() * plusOrMinus();
              if (monster.x <= 0) {
                monster.direction = 'right';
              }
              if (monster.x >= 1600) {
                monster.direction = 'left';
              }
              if (monster.direction === 'left') {
                monster.x -= random2();
                ctx.drawImage(monsterImages.mon1, (720 - this.state.monFrame2*90), 0, 90, 60, monster.x - 60, monster.y, 90, 60);
              } else {
                monster.x += random2();
                ctx.drawImage(monsterImages.mon1B, (720 - this.state.monFrame2*90), 0, 90, 60, monster.x - 60, monster.y, 90, 60);
              }
            }
            if (monster.monsterid === 3) {
              monster.y += random3() * plusOrMinus();
              if (monster.x <= 0) {
                monster.direction = 'right';
              }
              if (monster.x >= 1600) {
                monster.direction = 'left';
              }
              if (monster.direction === 'left') {
                monster.x -= random4();
              ctx.drawImage(monsterImages.mon2, 0, 0, 90, 60, monster.x - 60, monster.y, 90, 60);
              } else {
                monster.x += random4();
                ctx.drawImage(monsterImages.mon2B, (720 - this.state.monFrame2*90), 0, 90, 60, monster.x - 60, monster.y, 90, 60);
              }
            }
            if (monster.monsterid === 4) {
              if (monster.x <= 0 ) {
                monster.direction = "right"
              }
              if (monster.x >= 1300) {
                monster.direction = "left"
              }
              if (monster.direction === "left" ){
                if (this.state.finalBoss === 18) {
                  monster.x -= 2;
                }
                ctx.drawImage(monsterImages['final'+ this.state.finalBoss], 0, 0, 200, 200, monster.x, -10, 400, 400);
              } else {
                if (this.state.finalBoss === 18) {
                  monster.x += 2;
                }
                ctx.drawImage(monsterImages['finalB'+ this.state.finalBoss], 0, 0, 200, 200, monster.x, -10, 400, 400);
              }
            }
          } else {
            monster.travel = 0;
          }
          this.collisionDetect();
        }
      }
      ctx.fill();
    }, 1000/60);
  }

  createMonsters(num){
    let level = this.state.level;
    $.get('/monsters', { level }, (monsters) => {
      console.log(`Level ${level} start!`);
      this.setState({
        monsters: monsters
      });
    }, 'json')
    .done(() => {
      this.setState({
        level: this.state.level + 1
      });
      this.animateMonsters(num);
    });
  }

  listParty(players) {
    let playerNames = [];
    Object.values(players).forEach((player) => {
      playerNames.push(player.username);
    });
    this.setState({
      players: playerNames
    });
  }

  trade(player) {
    
  }

  collisionDetect() {
    let attacks = this.state.attacks.slice();
    let monsters = this.state.monsterList.slice();
    for (let i = 0; i < attacks.length; i++) {
      for(let j = 0; j < monsters.length; j++) {
        let attack = attacks[i];
        let monster = monsters[j];
        if(attacks[i] ==undefined ){
          attack = attacks[i+1];
        }
        if(monsters[j] ==undefined ){
          monster = monsters[j+1];
        }

          if(attack.x+70 >= monster.x && attack.x <=monster.x && attack.y + 60 >= monster.y && attack.y - 20 <= monster.y) {
            // if (monster[i]) BOSS HEALTH
            monsters = monsters.slice(0,j).concat(monsters.slice(j+1, monsters.length));
            if (!!!this.state.easymode) {
              attacks = attacks.slice(0, i).concat(attacks.slice(i+1, attacks.length));
            }

            console.log('monster died ' + monsters.length + ' monsters left')
            if (monsters.length === 0) {
              this.ready(5);
            }
            this.setState({
              monsterList: monsters,
              attacks: attacks
            });
          }
        
      }
    }
  }

  easyMode() {
    this.setState({
      easymode: !!!this.state.easymode
    })
  }

  increaseSize() {

  }

  rapidFire() {
    this.setState({
      attackRate: 50
    })
  }

  normalFire() {
    this.setState({
      attackRate: 100
    })
  }

  render () {
    return (
      <div>
        <button onClick={() => {this.ready(2)}}>Ready?</button>
        <button onClick={() => {this.easyMode()}}>Difficulty Changer</button>
        <button onClick={this.rapidFire}>Rapid Fire</button>
        <button onClick={this.normalFire}>Normal Fire</button>
        <div className={styles.hub}>
          <Trees gameState={this.state.gameState}/>
          <div id="ground" style={this.state.ground}>
            <div className={styles.groundCont}>
              <img id="spawn" className={styles.spawn} src="./img/spawn.png"></img>

            </div>
          </div>
          <canvas id="players" className={styles.canvas}></canvas>
          <canvas id="monsters" className={styles.canvas}></canvas>
          <canvas id="attacks" className={styles.canvas} ></canvas>
        </div>
        <div>Player List
          {_.map(this.state.players, (player) => {
            return <div>{player}</div>; 
          })}
        </div>
      </div>
    )
  }
}
