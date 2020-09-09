class MyMouse extends Mouse {
  bindTo(obj) { this.obj = obj }
  send(isDown) { this.obj.handleMouse(isDown) }
  handleMouseUp() { super.handleMouseUp(); this.send(this.angle()) }
  handleMouseMove({offsetX, offsetY}) {
    this.initX && (
      this.x = offsetX, this.y = offsetY,
      this.send(this.angle())
    )
  }
}

class MyRoom extends Room {
  constructor(host, width, height, players, id, handleEmit) {
    super(width, height);
    !host && (this.mouse = new MyMouse);
    this.players = players;
    this.handleEmit = handleEmit;
    this.score = 0;
    this.setup([...players.values()], id);
    this.step();
  }
  draw() { super.draw(); this.mouse && this.mouse.isDown() && this.mouse.draw(this.room) }
  setup(players, id) {
    const roomW = this.canvas.width;
    const roomH = this.canvas.height;
    this.objects['ball'] = [];
    this.objects['wall'] = [];
    const len = Math.ceil(players.length ** 0.5);
    for (let i = 0; i < players.length; i++) {
      const params = [players[i].x, players[i].y, 8];
      let ball;
      if (players[i].id === id) {
        ball = new MyBall(...params, '#e84118');
        this.mouse.bindTo(ball);
        ball.bindTo(this);
      } else ball = new Ball(...params);
      this.objects['ball'].push(ball);
      players[i].ball = ball;
    }
  }
  setQuestion(question) { this.question = question }
  emit(...data) { this.handleEmit(...data) }
}

class MyBall extends Ball {
  constructor(x, y, r, color) { super(x, y, r); this.color = color }
  bindTo(room) { this.room = room }
  handleMouse(angle) { this.room.emit('movement', angle) }
}