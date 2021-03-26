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
  constructor(container, width, height) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
    this.scale = 1;
    container.appendChild(this.canvas);
    this.requestFullscreen();
    this.fit(window.innerWidth, window.innerHeight);
    this.room = this.canvas.getContext('2d');
    this.question = null;
    this.objects = {};
  }
  requestFullscreen() {
    const e = document.body;
    if (e.requestFullscreen) e.requestFullscreen();
    else if (e.webkitRequestFullscreen) e.webkitRequestFullscreen();
    else if (e.mozRequestFullscreen) e.mozRequestFullscreen()
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
    this.x = x; this.y = y;
    this.vX = this.vY = 0;
    this.r = r; this.m = 1;
    this.ang = ang;
    this.type = 'ball';
    this.sprite = sprite;
    this.moving = false;
  }
  setState(x, y) { this.x = x; this.y = y }
  draw(roomW, roomH, room) {
    const { x, y, r } = this;
    const dxs = [roomW - x - r, -1, x - r];
    const dys = [roomH - y - r, -1, y - r];
    dxs.forEach((dx, i) => dys.forEach((dy, j) => (
      dx < 0 && dy < 0 && this.drawSingle(room, x + (i - 1) * roomW, y + (i - 1) * roomH, r + 2)
    )));
  }
  drawSingle(room, x, y, r) {
    room.translate(x, y);
    room.rotate(this.ang + Math.PI / 2);
    room.drawImage(this.sprite, -r, -r, r * 2, r * 2);
    room.rotate(-this.ang - Math.PI / 2);
    room.translate(-x, -y);
  }
  // {
  //   this.moving && (this.vX += 0.5 * Math.cos(this.ang), this.vY += 0.5 * Math.sin(this.ang));
  //   this.x += this.vX /= 1.05;
  //   this.y += this.vY /= 1.05;
  //   this.x > roomW && (this.x -= roomW);
  //   this.x < 0 && (this.x = roomW + this.x);
  //   this.y > roomH && (this.y -= roomH);
  //   this.y < 0 && (this.y = roomH - this.y);
  //   this.checkCollide(roomW, roomH, objects);
  // }
  // checkCollide(roomW, roomH, objects) {
  //   const { x: mx, y: my, r, m} = this;
  //   Object.values(objects).forEach(clan => clan.forEach(obj => {
  //     if (obj === this) return;
  //     if (obj.type === 'ball') {
  //       const { x: ox, y: oy, r: or } = obj;
  //       (mx - ox) ** 2 + (my - oy) ** 2 <= (r + or) ** 2 && this.collideBall(obj, 0, 0, roomW, roomH);
  //       (mx + roomW - ox) ** 2 + (my - oy) ** 2 <= (r + or) ** 2 && this.collideBall(obj, 1, 0, roomW, roomH);
  //       (mx - ox) ** 2 + (my + roomH - oy) ** 2 <= (r + or) ** 2 && this.collideBall(obj, 0, 1, roomW, roomH);
  //       (mx + roomW - ox) ** 2 + (my + roomH - oy) ** 2 <= (r + or) ** 2 && this.collideBall(obj, 1, 1, roomW, roomH);
  //     }
  //     if (obj.type === 'wall') {
  //       const { x1, y1, x2, y2, r: or } = obj;
  //       const line1X = x2 - x1;
  //       const line1Y = y2 - y1;
  //       const edge = line1X ** 2 + line1Y ** 2;
  //       let min = Infinity;
  //       let minX = 0, minY = 0;
  //       let moveX = 0, moveY = 0;
  //       [mx - roomW, mx, mx + roomW].forEach((x, i) => [my - roomH, my, my + roomH].forEach((y, j) => {
  //         const line2X = x - x1;
  //         const line2Y = y - y1;
  //         const t = Math.max(0, Math.min(edge, line1X * line2X + line1Y * line2Y)) / edge;
  //         const closestX = x1 + t * line1X;
  //         const closestY = y1 + t * line1Y;
  //         (x - closestX) ** 2 + (y - closestY) ** 2 <= (r + or) ** 2 && (
  //           min = (x - closestX) ** 2 + (y - closestY) ** 2,
  //           minX = closestX, minY = closestY,
  //           moveX = i - 1, moveY = j - 1
  //         );
  //       }));
  //       if (min <= (r + or) ** 2) {
  //         const fake = new Ball(minX, minY, or, m, 'static');
  //         this.collideBall(fake, moveX, moveY, roomW, roomH);
  //       }
  //     }
  //   }));
  // }
  // collideBall(target, moveX, moveY, roomW, roomH) {
  //   const m = this.m, om = target.m;
  //   let nX = target.x - this.x - moveX * roomW;
  //   let nY = target.y - this.y - moveY * roomH;
  //   let dist = Math.sqrt(nX ** 2 + nY ** 2);
  //   const overlap = dist - this.r - target.r;
  //   nX /= dist; nY /= dist;
  //   if (target.mode === 'static') { this.x += overlap * nX; this.y += overlap * nY }
  //   else if (this.mode === 'static') { target.x -= overlap * nX; target.y -= overlap * nY }
  //   else {
  //     this.x += overlap * nX * om / (m + om);
  //     this.y += overlap * nY * om / (m + om);
  //     target.x -= overlap * nX * m / (m + om);
  //     target.y -= overlap * nY * m / (m + om);
  //   }
  //   nX = target.x - this.x - moveX * roomW;
  //   nY = target.y - this.y - moveY * roomH;
  //   dist = Math.sqrt(nX ** 2 + nY ** 2);
  //   nX /= dist; nY /= dist;
  //   const p = 2 * (nX * (this.vX - target.vX) + nY * (this.vY - target.vY)) / (m + om);
  //   this.mode !== 'static' && (this.vX -= p * om * nX, this.vY -= p * om * nY);
  //   target.mode !== 'static' && (target.vX += p * m * nX, target.vY += p * m * nY);
  // }
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
    const dxs = [roomW - x1 - r, roomW - x2 - r, -1, x1 - r, x2 - r];
    const dys = [roomH - y1 - r, roomH - y2 - r, -1, y1 - r, y2 - r];
    const s = [-1, -1, 0, 1, 1];
    dxs.forEach((dx, i) => dys.forEach((dy, j) => dx < 0 && dy < 0 && (
      this.drawSingle(room, x1 + s[i] * roomW, y1 + s[j] * roomH, x2 + s[i] * roomW, y2 + s[j] * roomH, r + 2)
    )));
  }
  drawSingle(room, x1, y1, x2, y2, r) {
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
    this.colors = ['#ec407a', '#66bb6a', '#e67e22', '#7e57c2'];
  }
  draw(_roomW, _roomH, room) {
    const { size, colors } = this;
    this.positions.forEach((pos, i) => (room.fillStyle = colors[i], room.fillRect(...pos, size, size)));
  }
}