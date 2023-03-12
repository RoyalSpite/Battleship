import { HowToPlay } from './HowToPlay.js';
import { Instruction } from './Instruction.js';
import { Menu } from './Menu.js';
import { Planning } from './Planning.js';
import { Play } from './Play.js';
import { gameHeight, gameWidth } from './util_functions.js';

const config = {
  name : 'Blattleship',
  type : Phaser.AUTO,
  width : gameWidth,
  height : gameHeight,
  disableContextMenu: true,
  scene : [Menu, HowToPlay, Instruction, Planning, Play]
};

window.game = new Phaser.Game(config);
