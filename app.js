const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const path = require('path');
const { MyRoom } = require('./myengine.js');
const questions = require('./questions.js');

app.set('port', process.env.PORT || 3000);
app.use('/static', express.static(__dirname + '/static'));
app.get('/', (req,res) => res.sendFile(path.join(__dirname, 'index.html')));
server.listen(app.get('port'), () => console.log(`Starting on port ${app.get('port')}.`));

const players = new Map;
let room;
let host;

io.on('connect', socket => {
  const id = socket.id;
  
  socket.on('join', name => {
    if (room) {
      socket.emit('overdue');
    } else if (name === 'super') {
      host = id;
      io.to(host).emit('granted', players.size);
    } else if ([...players.values()].some(player => player.name === name)) {
      socket.emit('duplicated');
    } else {
      players.set(id, {id, name});
      socket.join('players');
      socket.emit('waiting');
      host && io.to(host).emit('players', players.size);
    }
  });
  
  socket.on('start', ([width, height]) => {
    if (id !== host) return;
    room = new MyRoom(width, height, players, (...data) => io.emit(...data), questions);
    io.emit('room', {
      width, height,
      players: [...players.values()].map(({id, x, y}) => [id, {id, x, y}]),
      question: { text: 'Are you ready?', answers: ['Yes', 'Yup', 'Yeah', 'So so'] }
    });
  });
  
  socket.on('movement', angle => {
    const ball = players.get(id).ball;
    if (angle) { ball.setAngle(angle); ball.setMoving(true) }
    else ball.setMoving(false);
  });

  socket.on('next_question', () => room.sendQuestion());
  
  socket.on('disconnect', () => {
    if (id !== host) {
      players.delete(id);
      !room && host && io.to(host).emit('players', players.size);
    }
  });
});