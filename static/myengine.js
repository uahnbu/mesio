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
  constructor(host, width, height, walls, players, id, handleEmit, sprites) {
    super(width, height);
    const { offsetLeft, offsetTop, offsetWidth, offsetHeight } = this.canvas;
    !host && (this.mouse = new MyMouse(this.canvas, this.scale, offsetLeft - offsetWidth / 2, offsetTop - offsetHeight / 2));
    this.players = players;
    this.handleEmit = handleEmit;
    this.score = 0;
    this.sprites = sprites;
    this.setup([...players.values()], walls, id);
    this.step();
  }
  draw() {
    const { width, height } = this.canvas;
    const room = this.room;
    room.fillStyle = '#6eddf8';
    room.beginPath();
    room.fillRect(0, 0, width, height);
    this.goal.draw(this.room);
    Object.values(this.objects).forEach(clan => clan.forEach(obj => obj.draw(width, height, room)));
    this.mouse && this.mouse.isDown() && this.mouse.draw(this.room);
  }
  setup(players, walls, id) {
    const roomW = this.canvas.width;
    const roomH = this.canvas.height;
    this.objects['wall'] = [];
    this.objects['ball'] = [];
    const len = Math.ceil(players.length ** 0.5);
    for (let i = 0; i < players.length; i++) {
      const params = [players[i].x, players[i].y, 16, 0];
      let ball;
      if (players[i].id === id) {
        ball = new MyBall(...params, this.sprites.pig);
        this.mouse.bindTo(ball);
        ball.bindTo(this);
      } else ball = new Ball(...params, this.sprites.mouse);
      this.objects['ball'].push(ball);
      players[i].ball = ball;
    }
    walls.forEach(([x1, y1, x2, y2]) => {
      x1 *= roomW; y1 *= roomH; x2 *= roomW; y2 *= roomH;
      const wall = new Wall(x1, y1, x2, y2, 8);
      this.objects['wall'].push(wall);
    });
    this.goal = new Goal(Math.min(roomW, roomH) / 3, roomW, roomH);
  }
  setQuestion(question) { this.question = question }
  emit(...data) { this.handleEmit(...data) }
}

class MyBall extends Ball {
  bindTo(room) { this.room = room }
  handleMouse(angle) { angle && (this.ang = angle), this.room.emit('movement', angle) }
}