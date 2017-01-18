"use strict";

const CLI = require('clui');
const Line = CLI.Line;
const LineBuffer = CLI.LineBuffer;
const clc = require('cli-color');
const readline = require('readline')

const Driver = require('./driver.js');
const State = require('./state.js');

class CLIApp {
  constructor() {
    clearScreen();

    // set up to read characters
    readline.emitKeypressEvents(process.stdin);
    process.stdin.setRawMode(true);
    process.stdin.on('keypress', (str,key)=>{this.processKeystroke(this,str,key)});

    // set up SR700 driver
    this.driver = new Driver();
    this.driver.setCallback(this,this.paint);
    this.driver.connect();
  }

  processKeystroke(cli,str,key) {
    var state = cli.driver.getDesiredState();
    if ( (key.ctrl && key.name === 'c') || key.name === 'escape' ) {
      cli.driver.disconnect();
      clearScreen();
      process.exit();
    } else if (key.name == 'c') {
      cli.driver.connect();
    } else if (key.name == 'd') {
      cli.driver.disconnect();
    } else if (key.name == 'up') {
      state.heatSetting = state.heatSetting==3?3:state.heatSetting+1;
    } else if (key.name == 'down') {
      state.heatSetting = state.heatSetting==0?0:state.heatSetting-1;
    } else if (key.name == 'left') {
      state.fanSpeed = state.fanSpeed==0?0:state.fanSpeed-1;
    } else if (key.name == 'right') {
      state.fanSpeed = state.fanSpeed==9?9:state.fanSpeed+1;
    }
    //else {
      //console.log(`You pressed the "${str}" key`);
      //console.log();
      //console.log(key);
      //console.log();
    //}

    if( state.fanSpeed > 0 ) {
      state.action = State.constants.action.ROASTING;
    } else {
      state.action = State.constants.action.IDLE;
    }
    cli.driver.setDesiredState(state);
    cli.paint(cli.driver.getObservedState(),cli.driver.getDesiredState());
  }


  paint(observedState, desiredState) {
    var outputBuffer = new LineBuffer({
      x: 0,
      y: 0,
      width: 'console',
      height: 'console'
    });

    var c = this.driver.isConnected

    var title = new Line(outputBuffer)
    .column(`SR700 Roaster (${c?'Connected':'Disconnected'})`, 30, [clc.green])
    .fill().store();

    var state = new Line(outputBuffer)
    .column(`Action: ${c?observedState.action:'-'}`, 10, [clc.cyan])
    .column(`Fan: ${c?observedState.fanSpeed:'-'}`, 10, [clc.cyan])
    .column(`heat: ${c?observedState.heatSetting:'-'}`, 10, [clc.cyan])
    .fill().store();

    var state = new Line(outputBuffer)
    .column(`Temp: ${c?observedState.temp:'-'}°F`, 10 [clc.orange])
    .fill().store();

    outputBuffer.output();
  }
}

function clearScreen() {
  process.stdout.write("\u001b[2J\u001b[0;0H");
}

function main() {
  var cli = new CLIApp();
}
module.exports = main;

require('make-runnable')
