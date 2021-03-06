const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const fs = require('file-system');
const mustacheEx = require('mustache-express');
const randomWords = require('random-words');
const words = fs.readFileSync("./words", "utf-8").toLowerCase().split("\n");
const dotenv = require('dotenv').config();


const app = express();

let port = process.env.PORT || 3000;
console.log(port);
app.engine('mustache', mustacheEx());

app.set('view engine', 'mustache');
app.set('views', __dirname + '/views');

app.use(express.static('public'));

app.use(bodyParser.urlencoded({extended: true}));

app.use(session({
  secret: 'eetz a secret',
  saveUninitialized: true,
  resave: false
}));


app.get('/', (req, res) => {

  if (!req.session.word || req.session.word === '' ) {
    // let index = Math.floor(Math.random() * words.length);
    req.session.word = randomWords().toUpperCase().split('');
    console.log(req.session.word);
    req.session.blanks = [];
    req.session.word.forEach(function(letter) {
      req.session.blanks.push('_');
    });
    req.session.blanksRemaining = req.session.blanks.length;
    req.session.correctCount = 0;
    req.session.incorrectCount = 0;
    req.session.guesses = [];
    req.session.guessesRemaining = req.session.word.length;
    req.session.alreadyGuessed = false;
    req.session.errorMessage = '';
  }
  res.render('index', req.session);
});

app.get('/winner', (req, res) => {
  res.render('winner');
});

app.get('/gameover', (req, res) => {
  res.render('gameover')
});

app.post('/', (req, res) => {
  let userInput = req.body.guess.toUpperCase();

  function isLetter(input) {
    //thanks, mdn
    let letter = /^[A-Z]+$/;
    if (input.match(letter)) {
      return true;
    } else {
      return false;
    }
  };

  if (isLetter(userInput)) {
    req.session.err = '';
  } else {
    req.session.err = 'Please enter a letter';
    res.redirect('/');
  }

  function showAnswer() {
    for (let i = 0; i < answer.length; i++) {
      if (userInput === answer[i]) {
        req.session.blanks[i] = answer[i];
      }
    }
  };

  function guessed() {
    for (let i = 0; i < req.session.guesses.length; i++) {
      if (req.session.guesses[i] === userInput) {
        return true;
      }
    }
    return false;
  };

  if (guessed()) {
    req.session.guessed = true;
    res.redirect('/');
  } else {
    req.session.guessed = false;
    req.session.guesses.push(userInput);
  }
  let answer = req.session.word;
  let correct = false;
  for (let i = 0; i < answer.length; i++) {
    if (userInput === answer[i]) {
      req.session.blanks[i] = answer[i];
      req.session.blanksRemaining--;
      isCorrect = true;
    }
  };
  if (correct) {
    req.session.correctCount++;
  } else {
    req.session.incorrectCount++;
    req.session.guessesRemaining--;
  }

  if (req.session.guessesRemaining == 0 && req.session.blanksRemaining > 0) {
    req.session.gameover = true;
    newGame();
    res.redirect('/gameover')
  }

  if (req.session.blanksRemaining == 0) {
    req.session.winner = true;
    newGame();
    res.redirect('/winner');
  }

  function newGame () {
    req.session.word = randomWords().toUpperCase().split('');
    console.log(req.session.word);
    req.session.blanks = [];
    req.session.word.forEach(function(letter) {
      req.session.blanks.push('_');
    });
    req.session.blanksRemaining = req.session.blanks.length;
    req.session.correctCount = 0;
    req.session.incorrectCount = 0;
    req.session.guesses = [];
    req.session.guessesRemaining = req.session.word.length;
    req.session.alreadyGuessed = false;
    req.session.errorMessage = '';
  };
  res.redirect('/');
});

app.listen(port, () =>{
  console.log(`Listening on PORT ${ port }.`);
});
