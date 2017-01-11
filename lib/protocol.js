"use strict",

// All details pulled from https://github.com/Roastero/freshroastsr700/blob/master/docs/communication_protocol.rst
// packets are all 14 bytes long, made up of 9 fields:
// header(2) tempUnit(2) flag(1) state(2) fanSpeed(1) timeRemaining(1) heatSetting(1) currTemp(2) footer(2)

const constants = {
  header: { init:"AA55", default:"AAAA" },
  tempUnit: {fahrenheit:"6174"},
  flag: {sentByComputer:"63", sentByRoaster:"00", currManualRoasterSetting:"A0", nonFinalRecipeLine:"AA", finalRecipeLine:"AF"},
  state: {idle:"0201", roasting:"0402", cooling:"0404", sleeping:"0801", blank:"0000"},
  fanSpeed: {min:"01", max:"09", blank:"00"},
  heatSetting: {cool:"00", low:"01", medium:"02", high:"03", blank:"00"},
  footer: "AAFA"
}

let constructPacketBytes = (header,tempUnit,flag,state,fanSpeed,timeRemaining,heatSetting,currTemp) => {
  let packetHex = header+tempUnit+flag+state+fanSpeed+timeRemaining+heatSetting+currTemp+constants.footer;
  if( packetHex.length != 28 ) {throw "Invalid hex input for packet construction: " + packetHex + " (should be 14 bytes)" }
  return Buffer.from(initPacketHex, 'hex');
}

let constructPacket = (opts) => {
  let defaults = {
    init: false,
    state: 'sleeping'
  }
  opts = Object.assign({},defaults,opts);

  if( opts.init == true ) { 
    // ignores all other fields, since an init packet is all blank where possible.
    return constructPacketBytes(constants.header.init,constants.tempUnit.fahrenheit,constants.flag.sentByComputer,constants.state.blank,constants.fanSpeed.blank,"00",constants.heatSetting.blank,"00");
  }

  // TODO: Continue here. 
  
}

module.exports.constants = constants;
module.exports.constructPacket = constructPacket;
