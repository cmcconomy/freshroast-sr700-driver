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
    if ( (key.ctrl && key.name === 'c') || key.name === 'q' || key.name === 'q' || key.name === 'escape' ) {
      cli.driver.disconnect();
      clearScreen();
      //console.log(cli.driver.log.entries.reduce((arr,log)=>{arr.push("Err:" + log.pidStats.error + " Out:" + log.pidStats.output);return arr;},[]));
      console.log(require('util').inspect(cli.driver.log, {depth:null}));
      process.exit();
    } else if (key.name == 'c') {
      cli.driver.connect();
    } else if (key.name == 'd') {
      cli.driver.disconnect();
    } else if (key.name == 'l') {
      console.log(cli.driver.log);
    } else if (key.name == 'm') {
      if( state.controlMode == 1 ) {
        state.controlMode = 0;
      } else {
        state.controlMode = 1;
      }
    } else if (key.name == 't') {
      if( state.temp == 200 ) {
        state.temp = 350;
      } else {
        state.temp = 200;
      }
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

    new Line(outputBuffer)
    .column(`SR700 Roaster (${c?'Connected':'Disconnected'})`, 'console', [clc.black.bgGreen])
    .fill().store();

    new Line(outputBuffer)
    .column(`Action: ${c?observedState.action:'-'}`, 10, [clc.cyan])
    .column(`Fan: ${c?observedState.fanSpeed:'-'}`, 10, [clc.cyan])
    .column(`Heat: ${c?observedState.heatSetting:'-'}`, 10, [clc.cyan])
    .column(JSON.stringify(observedState), 'console', [clc.cyan])
    .fill().store();

    new Line(outputBuffer)
    .column(`Temp: ${c?observedState.temp:'-'}F`,10, [clc.redBright])
    .fill().store();

    new Line(outputBuffer)
    .column(`Mode: ${c?desiredState.controlMode:'-'}`, 10, [clc.greenBright])
    .column(`TargetTemp: ${c?desiredState.temp:'-'}F`, 15, [clc.greenBright])
    .column(JSON.stringify(desiredState), 'console', [clc.greenBright])
    .fill().store();

    let lastPS = this.driver.log.entries[this.driver.log.entries.length-1].pidStats;
    new Line(outputBuffer)
    .column(`PID Error: ${c?lastPS.error:'-'}`, 15, [clc.blueBright])
    .column(`PID Output: ${c?lastPS.output:'-'}`, 15, [clc.blueBright])
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
