Math.ranInt = (min, max) => Math.round(Math.random() * (max - min + 1) + min);
Math.RAD = Math.PI / 180;

class Mouse {
  constructor() {
    this.initX = this.initY = this.x = this.y = null;
    document.onmousedown = document.ontouchstart = this.handleMouseDown.bind(this);
    document.onmouseup = document.ontouchend = this.handleMouseUp.bind(this);
    document.onmousemove = document.ontouchmove = this.handleMouseMove.bind(this);
  }
  isDown() { return this.initX }
  dist() { return this.initX ? Math.sqrt((this.x - this.initX) ** 2 + (this.y - this.initY) ** 2) : null }
  angle() { return this.initX ? Math.atan2(this.y - this.initY, this.x - this.initX) : null }
  handleMouseDown({offsetX, offsetY}) { this.initX = offsetX; this.initY = offsetY }
  handleMouseUp() { this.initX = null; this.initY = null }
  handleMouseMove({offsetX, offsetY}) { this.x = offsetX; this.y = offsetY }
  draw(room) {
    const r = Math.min(64, this.dist());
    const ang = this.angle();
    room.strokeStyle = '#f1c40f';
    room.beginPath();
    room.arc(this.initX, this.initY, r, 0, Math.PI * 2);
    room.stroke();
    room.fillStyle = '#f1c40f';
    room.beginPath();
    room.arc(this.initX + r * Math.cos(ang), this.initY + r * Math.sin(ang), 16, 0, Math.PI * 2);
    room.fill();
  }
}

class Room {
  constructor(width, height) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
    this.scale(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.canvas);
    this.room = this.canvas.getContext('2d');
    this.question = null;
    this.room.imageSmoothingEnabled = false;
    this.objects = {};
  }
  scale(containerW, containerH) {
    const canvas = this.canvas;
    if (canvas.width / canvas.height > containerW / containerH) {
      canvas.style.width = '100%';
      canvas.style.height = 100 / canvas.height * canvas.width + 'vw';
    } else {
      canvas.style.height = '100%';
      canvas.style.width = 100 / canvas.width * canvas.height + 'vh';
    }
  }
  draw() {
    const { width, height } = this.canvas;
    const room = this.room;
    room.fillStyle = '#222';
    room.beginPath();
    room.fillRect(0, 0, width, height);
    room.fillStyle = 'mediumvioletred';
    room.fillRect(width / 8, height / 8, width / 4, height / 4);
    room.fillStyle = 'darkkhaki';
    room.fillRect(width * 5/8, height / 8, width / 4, height / 4);
    room.fillStyle = 'darkgreen';
    room.fillRect(height / 8, height * 5/8, width / 4, height / 4);
    room.fillStyle = 'midnightblue';
    room.fillRect(width * 5/8, height * 5/8, width / 4, height / 4);
    Object.values(this.objects).forEach(clan => clan.forEach(obj => obj.draw(width, height, room)));
  }
  step() {
    const { width, height } = this.canvas;
    const objects = this.objects;
    Object.values(objects).forEach(clan => clan.forEach(obj => obj.step && obj.step(width, height, objects)));
    this.draw();
    requestAnimationFrame(this.step.bind(this));
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
  constructor(x, y, r) {
    this.x = x; this.y = y; this.r = r;
    this.color = '#9c88ff';
  }
  setPos(x, y) { this.x = x; this.y = y }
  draw(roomW, roomH, room) {
    const { x: mx, y: my, r } = this;
    [roomW - mx - r, mx - r, -1].forEach((x, i) => [roomH - my - r, my - r, -1].forEach((y, j) => {
      x < 0 && y < 0 && (
        this.drawSingle(room, [mx - roomW, mx + roomW, mx][i], [my - roomH, my + roomH, my][j], r)
      );
    }));
  }
  drawSingle(room, x, y, r) {
    room.fillStyle = this.color;
    room.beginPath();
    room.arc(x, y, r, 0, Math.PI * 2);
    room.fill();
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
  draw(roomW, roomH, room) {
    const { x1, y1, x2, y2, r } = this;
    let nX = x2 - x1, nY = y2 - y1;
    const d = r / Math.sqrt(nX ** 2 + nY ** 2);
    const tX = -nY * d, tY = nX * d;
    nX *= d; nY *= d;
    room.strokeStyle = '#2ecc71';
    room.beginPath();
    room.moveTo(x1 - tX, y1 - tY);
    room.arcTo(x1 - tX - nX, y1 - tY - nY, x1 - nX, y1 - nY, r);
    room.arcTo(x1 + tX - nX, y1 + tY - nY, x1 + tX, y1 + tY, r);
    room.lineTo(x2 + tX, y2 + tY);
    room.arcTo(x2 + tX + nX, y2 + tY + nY, x2 + nX, y2 + nY, r);
    room.arcTo(x2 - tX + nX, y2 - tY + nY, x2 - tX, y2 - tY, r);
    room.closePath();
    room.stroke();
  }
}