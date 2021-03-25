const { Room, Ball, Wall, Goal } = require('./engine.js');

class MyRoom extends Room {
  constructor(width, height, players, walls, handleEmit, questions) {
    super(width, height);
    this.players = players;
    this.handleEmit = handleEmit;
    this.questions = questions;
    this.myquestion = -1;
    this.movable = true;
    this.setup([...players.values()], walls);
    this.timer = setInterval(this.step.bind(this), 20);
  }
  clearTimer() { clearInterval(this.timer) }
  setup(players, walls) {
    const { width, height, objects } = this;
    objects['ball'] = [];
    const len = Math.ceil(players.length ** 0.5 / 2);
    const box = Math.ceil(players.length / 4);
    for (let i = 0; i < players.length; i++) {
      const x = (1/2 + (i / box | 0) % 2) * width / 2 + (i % box % len - len / 2) * 24 * 2;
      const y = (1/2 + (i / box / 2 | 0)) * height / 2 + ((i % box / len | 0) - len / 2) * 24 * 2;
      const ball = new MyBall(x, y, 24, 1, 'dynamic');
      objects['ball'].push(ball);
      players[i].x = x;
      players[i].y = y;
      players[i].ball = ball;
      players[i].score = 0;
    }
    objects['wall'] = [];
    walls.forEach(([x1, y1, x2, y2]) => {
      x1 *= width; y1 *= height; x2 *= width; y2 *= height;
      const wall = new Wall(x1, y1, x2, y2, 16);
      objects['wall'].push(wall);
    });
    this.goal = new Goal(Math.min(width, height) / 3, width, height);
  }
  step() {
    if (!this.movable) return;
    const { width, height, objects } = this;
    Object.values(objects).forEach(clan => clan.forEach(obj => obj.step && obj.step(width, height, objects)));
    const moved = [...this.players.values()].map(player => {
      if (
        Math.abs(player.x - player.ball.x) > 1 ||
        Math.abs(player.y - player.ball.y) > 1 ||
        Math.abs(player.vX - player.ball.vX) > 0.01 ||
        Math.abs(player.vY - player.ball.vY) > 0.01
      ) {
        const { x, y, vX, vY, ang } = player.ball;
        player.x = x;
        player.y = y;
        return { id: player.id, x, y, vX, vY, ang };
      }
      return null;
    }).filter(hold => hold !== null);
    moved.length !== 0 && this.emit('positions', moved);
    this.timing && this.timeStep();
  }
  timeStep() {
    this.timer % 50 === 0 && this.emit('time', (this.timeEnd - this.timer) / 50);
    super.timeStep();
  }
  sendQuestion() {
    if (++this.myquestion < this.questions.length) {
      this.emit('question', this.questions[this.myquestion]);
      this.movable = true;
      this.startTime(20, this.showAnswer);
    } else this.emit('ended');
  }
  showAnswer() {
    this.movable = false;
    const i = this.questions[this.myquestion].answer;
    const scores = [...this.players.values()].map(player => {
      const { x, y, r } = player.ball;
      this.goal.isInside(x, y, r, i) && player.score++;
      return { id: player.id, score: player.score };
    });
    this.emit('scores', scores);
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