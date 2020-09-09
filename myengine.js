const { Room, Ball, Wall } = require('./engine.js');

class MyRoom extends Room {
  constructor(width, height, players, handleEmit, questions) {
    super(width, height);
    this.players = players;
    this.handleEmit = handleEmit;
    this.questions = questions;
    this.myquestion = -1;
    this.movable = true;
    this.setup([...players.values()]);
    setInterval(this.step.bind(this), 20);
  }
  setup(players) {
    const { width: roomW, height: roomH } = this;
    this.objects['ball'] = [];
    this.objects['wall'] = [];
    const len = Math.ceil(players.length ** 0.5);
    for (let i = 0; i < players.length; i++) {
      const x = roomW / 2 + (i % len - len / 2) * 16;
      const y = roomH / 2 + ((i / len | 0) - len / 2) * 16;
      const ball = new MyBall(x, y, 8, 1, 'dynamic');
      this.objects['ball'].push(ball);
      players[i].x = x;
      players[i].y = y;
      players[i].ball = ball;
    }
  }
  step() {
    if (!this.movable) return;
    const { width, height, objects } = this;
    Object.values(objects).forEach(clan => clan.forEach(obj => obj.step && obj.step(width, height, objects)));
    const moved = [...this.players.values()].map(player => {
      if (player.x !== player.ball.x || player.y !== player.ball.y) {
        player.x = player.ball.x;
        player.y = player.ball.y;
        return { id: player.id, x: player.x, y: player.y };
      }
      return null;
    }).filter(hold => hold !== null);
    moved.length !== 0 && this.emit('positions', moved);
    this.timing && this.timeStep();
  }
  sendQuestion() {
    if (++this.myquestion < this.questions.length) {
      this.emit('question', this.questions[this.myquestion]);
      this.movable = true;
      this.startTime(15, this.showAnswer);
    }
  }
  showAnswer() {
    this.movable = false;
    this.emit('evaluate', this.questions[this.myquestion].answer);
  }
  emit(...data) { this.handleEmit(...data) }
}

class MyBall extends Ball {
  constructor(x, y, r, m, mode) {
    super(x, y, r, m, mode);
    this.moving = false;
  }
  setAngle(angle) { this.ang = angle }
  setMoving(isMoving) { this.moving = isMoving }
  step(roomW, roomH, objects) {
    this.moving && (
      this.vX += 0.5 * Math.cos(this.ang),
      this.vY += 0.5 * Math.sin(this.ang)
    );
    super.step(roomW, roomH, objects);
  }
}

module.exports = { MyRoom };