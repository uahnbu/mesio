class MyMouse extends Mouse {
  bindTo(obj) { this.obj = obj }
  send(data) { this.obj.handleMouse(data) }
  handleMouseUp() { super.handleMouseUp(); this.send(this.angle()) }
  handleMouseMove({offsetX, offsetY}) {
    this.initX && (super.handleMouseMove({offsetX, offsetY}), this.send(this.angle()));
  }
  handleTouchMove({touches}) {
    this.initX && (super.handleTouchMove({touches}), this.send(this.angle()));
  }
}

class MyRoom extends Room {
  constructor(host, container, width, height, walls, players, id, handleEmit, sprites) {
    super(container, width, height);
    const { offsetLeft, offsetTop, offsetWidth, offsetHeight } = this.canvas;
    !host && (this.mouse = new MyMouse(this.canvas, this.scale, offsetLeft - offsetWidth / 2, offsetTop - offsetHeight / 2));
    this.players = players;
    this.handleEmit = handleEmit;
    this.score = 0;
    this.sprites = sprites;
    this.room.font = '32px Arial';
    this.room.lineWidth = 3;
    this.setup(host, [...players.values()], walls, id);
    setInterval(this.step.bind(this), 20);
  }
  draw() {
    const { width, height } = this.canvas;
    const { room, objects, leaderboard } = this;
    room.fillStyle = '#6eddf8';
    room.beginPath();
    room.fillRect(0, 0, width, height);
    Object.values(objects).forEach(clan => clan.forEach(obj => obj.draw(width, height, room)));
    this.mouse && this.mouse.isDown() && this.mouse.draw(this.room);
    leaderboard && leaderboard.forEach(({name, score}, i) => (
      room.fillText(name + ' 🚩 ' + score, 16, height - 32 * (leaderboard.length - i))
    ));
  }
  setup(host, players, walls, id) {
    const roomW = this.canvas.width;
    const roomH = this.canvas.height;
    this.objects['goal'] = [];
    this.objects['wall'] = [];
    this.objects['ball'] = [];
    for (let i = 0; i < players.length; i++) {
      const params = [players[i].x, players[i].y, 24, 0];
      let ball;
      if (players[i].id === id) {
        ball = new MyBall(...params, this.sprites.pig);
        this.mouse.bindTo(ball);
        ball.bindTo(this);
        this.objects['goal'].push(new MyGoal(Math.min(roomW, roomH) / 3, roomW, roomH, ball));
      } else ball = new Ball(...params, this.sprites.mouse);
      this.objects['ball'].push(ball);
      players[i].ball = ball;
    }
    this.objects['goal'].length === 0 && this.objects['goal'].push(new Goal(Math.min(roomW, roomH) / 3, roomW, roomH));
    walls.forEach(([x1, y1, x2, y2]) => {
      x1 *= roomW; y1 *= roomH; x2 *= roomW; y2 *= roomH;
      const wall = new Wall(x1, y1, x2, y2, 16);
      this.objects['wall'].push(wall);
    });
    host && (this.leaderboard = players.slice(-10).map(({name}) => ({ name, score: 0 })));
  }
  setQuestion(question) { this.question = question }
  emit(...data) { this.handleEmit(...data) }
  updateLeaderboard(players) {
    players.forEach(({id, score}) => this.players.get(id).score = score);
    const newLeaderboard = players.sort((a, b) => b.score - a.score);
    const leaderboard = this.leaderboard;
    for (let i = 0; i < leaderboard.length; i++) {
      const { id, score } = newLeaderboard[i];
      leaderboard[i].name = this.players.get(id).name;
      leaderboard[i].score = score;
    }
  }
  downloadLeaderboard() {
    const text = 'Player,Score\n' + (
      [...this.players.values()].map(({name, score}) => name + ',' + score).join('\n')
    );
    const link = document.createElement('a');
    link.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    link.setAttribute('download', 'leaderboard.csv');
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

class MyBall extends Ball {
  bindTo(room) { this.room = room }
  handleMouse(angle) {
    (this.moving = !!angle) && (this.ang = angle);
    this.room.emit('movement', { angle, time: Date.now() });
  }
  step(_roomW, _roomH, objects) {
    this.goaling = objects['goal'][0].contains(this);
  }
}

class MyGoal extends Goal {
  constructor(size, totalW, totalH, ball) {
    super(size, totalW, totalH);
    this.belovedBall = ball;
  }
  contains(goalX, goalY) { 
    const { x, y, r } = this.belovedBall;
    const size = this.size;
    return x - r > goalX && x + r < goalX + size && y - r > goalY && y + r < goalY + size;
  }
  draw(_roomW, _roomH, room) {
    const { size, colors } = this;
    this.positions.forEach((pos, i) => (
      room.fillStyle = colors[i] + (this.contains(...pos) ? '' : 'aa'),
      room.fillRect(...pos, size, size)
    ));
  }
}