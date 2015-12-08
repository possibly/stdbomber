const execFileSync = require('child_process').execFileSync;
const readdirSync = require('fs').readdirSync;
const execSync = require('child_process').execSync;
const playerDirectory = process.cwd()+'/players/';
var legend = {
  '#': 'Wall',
  '.': 'Background',
  'C': 'Crate' //Breakable with bombs.
}
var map = `####################
#..................#
#.....C.C.C......C.#
#..........C.......#
####################`;
var world = [];
var alivePlayers = [];
var rounds = 1;
var turnIndex = 0;
var api = {
  'move': ['up','down','left','right'],
  'place': ['bomb'],
}

function test(){
  // console.log( validAction( api, action( ( initPlayers(playerDirectory)[0] ) ) ) );
  
  // console.log(initWorld(map, legend));

  // world = initWorld(map, legend);
  // alivePlayers = initPlayers(playerDirectory);
  // addPlayersToWorld(world, map, legend, alivePlayers);
  // console.log(world);
}

test();

function main(){
  world = initWorld(map, legend);
  alivePlayers = initPlayers(playerDirectory);
  addPlayersToWorld(world, map, legend, alivePlayers);

  while ( alivePlayers.length >= 1 ){
    var player = alivePlayers[turnIndex];
    var action = action(player);
    if ( validAction(action) ){
      performAction(action);
    }else{ 
      skipPlayersTurn();
    }

    allPlayersHaveHadOneTurn() ? turnIndex = 0 : turnIndex += 1;
  }

  endGame();
}

function performAction(){
  /* Implement the api! */
  return false;
}

function skipPlayersTurn(){
  /* Tell the player they made a mistake, or at least broadcast it somewhere. */
  return false;
}

function endGame(){
  /* Broadcast results somehow */
  return false;
}

function validAction(api, action){
  action = action.toString().trim(); //Ex: action = "place bomb"
  if ( api[action.split('')[0]] ){ // action = ['place', 'bomb'], 'place' is in api.
    if ( api[action.split('')[0]][action.split('')[1]] ){ // 'place' is followed by 'bomb'
      return true;
    }else{
      return false;
    }
  }else{
    return false;
  }
}

function allPlayersHaveHadOneTurn(){ return turnIndex === alivePlayers.length }

//[ { character: '#', vector: [ 0, 0, null ] }, ... ]
function initWorld(map, legend){
  var listOfObjects = [];
  map.split('\n').forEach( (line, row) => line.split('').forEach( (character, col) => listOfObjects.push( worldObject(character,row,col) ) ) );
  return listOfObjects;
}

function initPlayers(playerDirectory){
  var files = readdirSync(playerDirectory);
  var paths = files.map( file => playerDirectory+file );
  var players = [];
  paths.forEach( path => {
    execSync('chmod +x '+path);
    players.push( player(path) )
  });
  return players;
}

function player(filePath){
  return {
    'character': filePath.split('/')[filePath.split('/').length-1][0].toUpperCase(), //The capitalized first initial of the players filename.
    'view': [],
    'vector': Vector(null,null,null),
    'path': filePath,
    'canPlaceBomb': false
  }
}

function addPlayersToWorld(world, map, legend, players){
  var biggestRow = map.split('\n').length;
  var biggestCol = map.split('\n')[0].length // WARNING! This treats the first row of the map as the "biggestCol". Keep maps square!
  players.forEach( p => {
    while ( p['vector'][0] === null ){
      var randRow = Math.floor(Math.random() * (biggestRow));
      var randCol = Math.floor(Math.random() * (biggestCol));
      var objectsList = objectsAt(world, Vector(randRow, randCol, null)) // List of all objects at this location.
      if (objectsList.length > 1){ //more than one object at this location.
        break;
      }
      else if( legend[objectsList[0]['character']] === 'Background' ){
        p['vector'] = Vector(randRow, randCol, null);
        put( world, p );
      }
    }
  });
}

//Put an object into the world's list, and remove any object that shares the same vector row/col.
function put(world, putObj){
  world.forEach( (o, index) => {
    if ( o['vector'][0] === putObj['vector'][0] && o['vector'][1] === putObj['vector'][1] ){ //they share the same row/col
      world[index] = putObj;
      return true;
    }
  });

  return new Error('Tried to put '+putObj+' into the world but that vector is not in the worlds bounds!');
}

//Returns the list of objects that match the vectors row/col coordinates.
function objectsAt(world, vector){
  var list = world.filter( o => o['vector'][0] === vector[0] && o['vector'][1] === vector[1] );
  return list;
}

function Vector(row, col, direction){
  return [row, col, direction];
}

function worldObject(character, row, col){
  return {
    'character': character,
    'vector': Vector(row, col, null)
  }
}

function action(player){
  var showThePlayer = [player.canPlaceBomb, player.view];
  return execFileSync(player.path, [], { input: JSON.stringify(showThePlayer) });
}