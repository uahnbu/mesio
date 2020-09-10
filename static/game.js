!function (socket) {
  const init = document.querySelector('#init');
  const label = init.querySelector('label');
  const input = init.querySelector('input');
  const button = init.querySelector('button');
  const congrats = document.querySelector('#congrats');
  const answerDiva = [...document.querySelectorAll('#answer-container div')];

  let id;
  socket.on('connect', () => id = socket.id);
  
  const sprites = { mouse: null, pig: null };
  for (let sprite in sprites) {
    const img = new Image();
    img.src = './static/' + sprite + '.png';
    sprites[sprite] = img;
  }

  let room;
  let isHost = false;
  let isAsking = false;

  button.onclick = () => {
    if (isHost && !isAsking) {
      isAsking = true;
      socket.emit('start', [window.innerWidth, window.innerHeight]);
    } else if (isAsking) {
      socket.emit('next_question');
    } else {
      socket.emit('join', input.value);
    }
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
    init.removeChild(button);
  });
  
  socket.on('room', ({ width, height, walls, players, question }) => {
    room = new MyRoom(isHost, width, height, walls, new Map(players), id, (...data) => socket.emit(...data), sprites);
    document.body.classList.add('question');
    init.classList.remove('waiting');
    init.classList.add('question');
    isHost && init.removeChild(input);
    button.innerHTML = 'Next question';
    label.innerHTML = question.text;
    answerDiva.forEach((div, i) => div.innerHTML = question.answers[i]);
  });
  
  socket.on('positions', moved => moved.forEach(({id, x, y}) => room.players.get(id).ball.setPos(x, y)));

  socket.on('question', question => {
    label.innerHTML = question.text;
    answerDiva.forEach((div, i) => div.innerHTML = question.answers[i]);
  });

  socket.on('time', time => input.value = '⌛ ' + time + ' - 🚩 ' + room.score);

  socket.on('point', targetID => id === targetID && (
    input.value = '⌛ 0 - 🚩 ' + ++room.score,
    congrats.classList.add('show'),
    setTimeout(() => congrats.classList.remove('show'), 1000)
  ));
}(io());