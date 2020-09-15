let room;

!function (socket) {
  const init = document.querySelector('#init');
  const label = init.querySelector('label');
  const input = init.querySelector('input');
  const button = init.querySelector('button');
  const talk = document.querySelector('#talk');
  const answerDiva = [...document.querySelectorAll('#answer-container div')];

  let id;
  socket.on('connect', () => id = socket.id);
  
  const sprites = { mouse: null, pig: null };
  for (let sprite in sprites) {
    const img = new Image();
    img.src = './static/' + sprite + '.png';
    sprites[sprite] = img;
  }

  let isHost = false;
  let isAsking = false;
  let gameOver = false;

  button.onclick = () => {
    if (isHost && !isAsking) {
      isAsking = true;
      socket.emit('start', [window.innerWidth, window.innerHeight]);
    } else if (isAsking) socket.emit('next_question');
    else if (gameOver) room.downloadLeaderboard();
    else socket.emit('join', input.value);
  };

  socket.on('granted', n => {
    init.classList.add('host');
    label.innerHTML = 'Administrator';
    button.innerHTML = 'START GAME';
    input.value = '🧑 ' + n;
    isHost = true;
  });
  
  socket.on('players', n => input.value = '🧑 ' + n);
  
  socket.on('duplicated', () => alert('Name taken. Please choose another name'));
  
  socket.on('overdue', () => alert('Game started. Please join on next game'));
  
  socket.on('waiting', () => {
    init.classList.add('waiting');
    label.innerHTML = 'Please wait for host to start the game...';
    button.innerHTML = input.value;
    init.removeChild(input);
  });
  
  socket.on('room', ({ width, height, walls, players, question }) => {
    const playerMap = new Map(players);
    room = new MyRoom(isHost, width, height, walls, playerMap, id, (...data) => socket.emit(...data), sprites);
    document.body.classList.add('question');
    init.classList.remove('waiting');
    init.classList.add('question');
    isHost && init.removeChild(input);
    label.innerHTML = question.text;
    answerDiva.forEach((div, i) => div.innerHTML = question.answers[i]);
  });
  
  socket.on('positions', moved => moved.forEach(({id, x, y}) => room.players.get(id).ball.setPos(x, y)));

  socket.on('question', question => {
    label.innerHTML = question.text;
    answerDiva.forEach((div, i) => div.innerHTML = question.answers[i]);
  });

  socket.on('time', time => button.innerHTML = '⌛ ' + time + (isHost ? '' : ' - 🚩 ' + room.score));

  socket.on('scores', players => {
    !isHost && players.forEach(player => {
      if (player.id !== id) return;
      if (player.score !== room.score) {
        room.score = player.score;
        talk.classList.add('congrats', 'show');
      } else {
        talk.classList.add('tried', 'show');
      }
      button.innerHTML = '⌛ 0 - 🚩 ' + room.score;
      setTimeout(() => talk.classList.remove('congrats', 'tried', 'show'), 2000);
    });
    isHost && (button.innerHTML = 'Next question', room.updateLeaderboard(players));
  });

  socket.on('ended', () => isHost && (gameOver = true, button.innerHTML = 'Download leaderboard'));
}(io());