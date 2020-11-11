var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var path = require('path');

var gameArr;

app.set('view engine','ejs');

app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public'));

app.get('/', function(req, res) {
  res.render('pages/start');
});
// Create gameArr and render on game site
//getWords("german");

io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('card', (msg) => {
        console.log('card: ' + msg);
        gameArr[msg].turned = true;
        io.emit('card', msg);
    });
    socket.on('turn', () => {
        io.emit('turn');
      });
    socket.on('disconnect', () => {
      console.log('user disconnected');
    });
  });

http.listen(3000, () => {
  console.log('listening on *:3000');
});


function hostCreateNewGame() {
  // Create a unique Socket.IO Room
  var thisGameId = ( Math.random() * 100000 ) | 0;

  // Return the Room ID (gameId) and the socket ID (mySocketId) to the browser client
  this.emit('newGameCreated', {gameId: thisGameId, mySocketId: this.id});

  // Join the Room and wait for the players
  this.join(thisGameId.toString());
};

function getWords(language){
  //read csv to json object
  var columns = ["word"];
  var arr = require("csv-to-array")({
    file: "words_"+language+".csv",
    columns: columns
  }, function (err, array) {//callback

    //generate new random game json
    gameArr = generateNewGame(array);

    //render game site with random game
    app.get('/', function(req, res) {
      res.render('pages/game',{
        game:gameArr
      });
    });
  });
}

function generateNewGame(jsonWords){
  var gameArr = [];
  //init color counts
  var redCount = 8;
  var blueCount = 9;
  var blackCount = 7;

  while(gameArr.length < 25){
    var r = Math.floor(Math.random() * jsonWords.length);
    if(gameArr.indexOf(jsonWords[r]) === -1){

      // Assign new word to array
      gameArr.push(jsonWords[r]);

      var pos = gameArr.length - 1;

      //init taken value
      gameArr[pos] = Object.assign(gameArr[pos],{"turned":false});

      while(true){

        //End if all colors taken
        if(redCount == 0 && blueCount == 0 && blackCount == 0){
          break;
        }

        //rnd color pick
        var colorRnd = Math.floor(Math.random() * 3);

        console.log(colorRnd);
        //set color while count isn´t 0.Repeat if count zero
        if(colorRnd == 0 && blueCount > 0){
          gameArr[pos] = Object.assign(gameArr[pos],{"color":1});
          blueCount--;
          break;
        }else if(colorRnd == 1 && redCount > 0){
          gameArr[pos] = Object.assign(gameArr[pos],{"color":2});
          redCount--;
          break;
        }else if(colorRnd == 2 && blackCount > 0){
          gameArr[pos] = Object.assign(gameArr[pos],{"color":3});
          blackCount--;
          break;
        }
      }
    }
  }
  // set the bomb at random place
  var bombRnd = Math.floor(Math.random() * 25);
  gameArr[gameArr.length - 1].color = gameArr[bombRnd].color;
  gameArr[bombRnd].color = 4;
  console.log(gameArr)
  console.log("ÄNDERUNG");

  return gameArr;
}
