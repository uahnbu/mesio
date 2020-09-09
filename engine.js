Math.ranInt = (min, max) => Math.round(Math.random() * (max - min + 1) + min);
Math.RAD = Math.PI / 180;

class Room {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.objects = {};
  }
  step() {
    const { width, height, objects } = this;
    Object.values(objects).forEach(clan => clan.forEach(obj => obj.step && obj.step(width, height, objects)));
    setInterval(this.step.bind(this), 20);
  }
  startTime(seconds, callback) {
    this.timeEnd = seconds * 1000 / 20;
    this.timer = 0;
    this.timerCallback = callback;
    this.timing = true;
  }
  timeStep() {
    if (++this.timer === this.timeEnd) {
      this.timing = false;
      this.timerCallback();
    }
  }
}

class Ball {
  constructor(x, y, r, m, mode) {
    this.x = x; this.y = y; this.r = r; this.m = m;
    this.vX = this.vY = this.ang = 0;
    this.mode = mode;
    this.type = 'ball';
  }
  step(roomW, roomH, objects) {
    this.x += this.vX /= 1.05;
    this.y += this.vY /= 1.05;
    this.x > roomW && (this.x -= roomW);
    this.x < 0 && (this.x = roomW + this.x);
    this.y > roomH && (this.y -= roomH);
    this.y < 0 && (this.y = roomH - this.y);
    this.checkCollide(roomW, roomH, objects);
  }
  checkCollide(roomW, roomH, objects) {
    const { x: mx, y: my, r, m} = this;
    Object.values(objects).forEach(clan => clan.forEach(obj => {
      if (obj !== this) {
        if (obj.type === 'ball') {
          const { x: ox, y: oy, r: or } = obj;
          (mx - ox) ** 2 + (my - oy) ** 2 <= (r + or) ** 2 && this.collideBall(obj, 0, 0, roomW, roomH);
          (mx + roomW - ox) ** 2 + (my - oy) ** 2 <= (r + or) ** 2 && this.collideBall(obj, 1, 0, roomW, roomH);
          (mx - ox) ** 2 + (my + roomH - oy) ** 2 <= (r + or) ** 2 && this.collideBall(obj, 0, 1, roomW, roomH);
          (mx + roomW - ox) ** 2 + (my + roomH - oy) ** 2 <= (r + or) ** 2 && this.collideBall(obj, 1, 1, roomW, roomH);
        }
        if (obj.type === 'wall') {
          const { x1, y1, x2, y2, r: or } = obj;
          const line1X = x2 - x1;
          const line1Y = y2 - y1;
          const edge = line1X ** 2 + line1Y ** 2;
          let min = Infinity;
          let minX = 0, minY = 0;
          let moveX = 0, moveY = 0;
          [mx - roomW, mx, mx + roomW].forEach((x, i) => [my - roomH, my, my + roomH].forEach((y, j) => {
            const line2X = x - x1;
            const line2Y = y - y1;
            const t = Math.max(0, Math.min(edge, line1X * line2X + line1Y * line2Y)) / edge;
            const closestX = x1 + t * line1X;
            const closestY = y1 + t * line1Y;
            (x - closestX) ** 2 + (y - closestY) ** 2 <= (r + or) ** 2 && (
              min = (x - closestX) ** 2 + (y - closestY) ** 2,
              minX = closestX, minY = closestY,
              moveX = i - 1, moveY = j - 1
            );
          }));
          if (min <= (r + or) ** 2) {
            const fake = new Ball(minX, minY, or, m, 'static');
            this.collideBall(fake, moveX, moveY, roomW, roomH);
          }
        }
      }
    }));
  }
  collideBall(target, moveX, moveY, roomW, roomH) {
    const m = this.m, om = target.m;
    let nX = target.x - this.x - moveX * roomW;
    let nY = target.y - this.y - moveY * roomH;
    let dist = Math.sqrt(nX ** 2 + nY ** 2);
    const overlap = dist - this.r - target.r;
    nX /= dist; nY /= dist;
    if (target.mode === 'static') { this.x += overlap * nX; this.y += overlap * nY }
    else if (this.mode === 'static') { target.x -= overlap * nX; target.y -= overlap * nY }
    else {
      this.x += overlap * nX * om / (m + om);
      this.y += overlap * nY * om / (m + om);
      target.x -= overlap * nX * m / (m + om);
      target.y -= overlap * nY * m / (m + om);
    }
    nX = target.x - this.x - moveX * roomW;
    nY = target.y - this.y - moveY * roomH;
    dist = Math.sqrt(nX ** 2 + nY ** 2);
    nX /= dist; nY /= dist;
    const p = 2 * (nX * (this.vX - target.vX) + nY * (this.vY - target.vY)) / (m + om);
    this.mode !== 'static' && (this.vX -= p * om * nX, this.vY -= p * om * nY);
    target.mode !== 'static' && (target.vX += p * m * nX, target.vY += p * m * nY);
  }
}

class Wall {
  constructor(x1, y1, x2, y2, r) {
    this.x1 = x1; this.y1 = y1;
    this.x2 = x2; this.y2 = y2;
    this.r = r;
    let nX = this.x2 - this.x1;
    let nY = this.y2 - this.y1;
    const d = this.r / Math.sqrt(nX ** 2 + nY ** 2);
    nX *= d; nY *= d;
    this.x1 += nX; this.y1 += nY;
    this.x2 -= nX; this.y2 -= nY;
    this.type = 'wall';
  }
}

module.exports = { Room, Ball, Wall };