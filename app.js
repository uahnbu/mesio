// const networkInterfaces = require('os').networkInterfaces();
const address = '' // networkInterfaces['Wi-Fi'].filter(network => network.family === 'IPv4')[0].address;

const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const { MyRoom } = require('./myengine.js');
const { questions, walls } = require('./json.js');

app.set('port', process.env.PORT || 3000);
app.set('hostname', address || 'localhost');
app.use('/static', express.static('static'));
app.get('/', (_req, res) => res.sendFile('index.html', { root: __dirname }));
server.listen(
  app.get('port'),
  // app.get('hostname'),
  () => console.log(`Starting on port ${app.get('hostname')}:${app.get('port')}.`)
);

const players = new Map;
let room;
let host;

io.on('connect', socket => {
  const id = socket.id;
  
  socket.on('join', name => {
    if (room) {
      socket.emit('overdue');
    } else if (name === 'supercalafragalisticexpialadocious') {
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
    room = new MyRoom(width, height, players, walls, (...data) => io.emit(...data), questions);
    io.emit('room', {
      width, height, walls,
      players: [...players.values()].map(({id, name, x, y}) => [id, {id, name, x, y}]),
      question: { text: 'Are you ready?', answers: ['A. Yes', 'B. Yup', 'C. Yeah', 'D. So so'] }
    });
  });
  
  socket.on('movement', angle => {
    if (!room) return;
    const ball = players.get(id).ball;
    if (angle) { ball.setAngle(angle); ball.setMoving(true) }
    else ball.setMoving(false);
  });

  socket.on('next_question', () => room && room.sendQuestion());
  
  socket.on('disconnect', () => {
    if (id !== host) {
      players.delete(id);
      !room && host && io.to(host).emit('players', players.size);
    } else {
      players.clear();
      room && (room.clearTimer(), room = null);
      host = null;
    }
  });
});