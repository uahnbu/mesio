Math.ranInt = (min, max) => Math.round(Math.random() * (max - min + 1) + min);
Math.RAD = Math.PI / 180;

class Mouse {
  constructor(obj, scale, anchorX, anchorY) {
    this.initX = this.initY = this.x = this.y = null;
    this.scale = scale;
    this.anchorX = anchorX; this.anchorY = anchorY;
    obj.onmousedown = this.handleMouseDown.bind(this);
    obj.onmouseup = obj.ontouchend = obj.ontouchcancel = this.handleMouseUp.bind(this);
    obj.onmousemove = this.handleMouseMove.bind(this);
    obj.ontouchstart = this.handleTouchStart.bind(this);
    obj.ontouchmove = this.handleTouchMove.bind(this);
  }
  isDown() { return this.initX }
  dist() { return this.initX ? Math.sqrt((this.x - this.initX) ** 2 + (this.y - this.initY) ** 2) : null }
  angle() { return this.initX ? Math.atan2(this.y - this.initY, this.x - this.initX) : null }
  handleMouseDown({offsetX, offsetY}) { this.initX = offsetX / this.scale; this.initY = offsetY / this.scale }
  handleMouseUp() { this.initX = null; this.initY = null; this.x = null; this.y = null; }
  handleMouseMove({offsetX, offsetY}) { this.x = offsetX / this.scale; this.y = offsetY / this.scale }
  handleTouchStart({touches}) {
    const { clientX, clientY } = touches[0];
    this.initX = (clientX - this.anchorX) / this.scale; this.initY = (clientY - this.anchorY) / this.scale;
  }
  handleTouchMove({touches}) {
    const { clientX, clientY } = touches[0];
    this.x = (clientX - this.anchorX) / this.scale; this.y = (clientY - this.anchorY) / this.scale;
  }
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
    this.scale = 1;
    document.body.appendChild(this.canvas);
    this.fit(window.innerWidth, window.innerHeight);
    this.room = this.canvas.getContext('2d');
    this.room.imageSmoothingEnabled = false;
    this.question = null;
    this.objects = {};
  }
  fit(containerW, containerH) {
    const canvas = this.canvas;
    if (canvas.width / canvas.height > containerW / containerH) {
      canvas.style.width = '100vw';
      canvas.style.height = 100 / canvas.width * canvas.height + 'vw';
    } else {
      canvas.style.height = '100vh';
      canvas.style.width = 100 / canvas.height * canvas.width + 'vh';
    }
    this.scale = canvas.offsetWidth / canvas.width;
  }
  draw() {
    const { width, height } = this.canvas;
    const room = this.room;
    room.fillStyle = '#222';
    room.beginPath();
    room.fillRect(0, 0, width, height);
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
  constructor(x, y, r, ang, sprite) {
    this.x = x; this.y = y; this.r = r; this.ang = ang;
    this.sprite = sprite;
  }
  setPos(x, y) { this.x = x; this.y = y }
  draw(roomW, roomH, room) {
    const { x: mx, y: my, r } = this;
    [roomW - mx - r, mx - r, -1].forEach((x, i) => [roomH - my - r, my - r, -1].forEach((y, j) => {
      x < 0 && y < 0 && (
        this.drawSingle(room, [mx - roomW, mx + roomW, mx][i], [my - roomH, my + roomH, my][j], r + 2)
      );
    }));
  }
  drawSingle(room, x, y, r) {
    room.translate(x, y);
    room.rotate(this.ang + Math.PI / 2);
    room.drawImage(this.sprite, -r, -r, r * 2, r * 2);
    room.rotate(-this.ang - Math.PI / 2);
    room.translate(-x, -y);
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
  draw(_roomW, _roomH, room) {
    const { x1, y1, x2, y2, r } = this;
    let nX = x2 - x1, nY = y2 - y1;
    const d = r / Math.sqrt(nX ** 2 + nY ** 2);
    const tX = -nY * d, tY = nX * d;
    nX *= d; nY *= d;
    room.fillStyle = '#fff';
    room.beginPath();
    room.moveTo(x1 - tX, y1 - tY);
    room.arcTo(x1 - tX - nX, y1 - tY - nY, x1 - nX, y1 - nY, r);
    room.arcTo(x1 + tX - nX, y1 + tY - nY, x1 + tX, y1 + tY, r);
    room.lineTo(x2 + tX, y2 + tY);
    room.arcTo(x2 + tX + nX, y2 + tY + nY, x2 + nX, y2 + nY, r);
    room.arcTo(x2 - tX + nX, y2 - tY + nY, x2 - tX, y2 - tY, r);
    room.closePath();
    room.fill();
  }
}

class Goal {
  constructor(size, totalW, totalH) {
    const size2 = size >> 1;
    this.size = size;
    this.positions = [
      [totalW / 4 - size2  , totalH / 4 - size2  ],
      [totalW * 3/4 - size2, totalH / 4 - size2  ],
      [totalW / 4 - size2  , totalH * 3/4 - size2],
      [totalW * 3/4 - size2, totalH * 3/4 - size2]
    ];
    this.colors = ['#ec407a', '#66bb6a', '#ffa726', '#7e57c2'];
  }
  draw(room) {
    const { size, colors } = this;
    this.positions.forEach((pos, i) => (room.fillStyle = colors[i], room.fillRect(...pos, size, size)));
  }
}