const delta = 0.5;

function equals(float1: number, float2: number, delta: number): boolean {
  return float1 >= float2 - delta && float1 <= float2 + delta
}

export class Point {
  public readonly x: number;
  public readonly y: number;


  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  public distanceBetween(point: Point): number {
    let x1 = this.x, x2 = point.x,
      y1 = point.y, y2 =point.y
    return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y2 - y1, 2))
  }
}

export class Straight {
  public readonly A: number;
  public readonly B: number;
  public readonly C: number;


  constructor(A: number, B: number, C: number) {
    this.A = A;
    this.B = B;
    this.C = C;
  }

  public intersection(line: Straight): Point | null {
    let a1 = this.A, a2 = line.A,
      b1 = this.B, b2 = line.B,
      c1 = this.C, c2 = line.C

    let x = (b1*c2 - b2*c1) / (a1*b2 - a2*b1)
    let y = (c1*a2 - c2*a1) / (a1*b2 - a2*b1)
    if(!isFinite(x) || !isFinite(y)) {
      return null
    }

    return new Point(x, y)
  }
}

export class Line {
  public straight: Straight;
  public from: Point;
  public to: Point;
  public angle: number

  constructor(from: Point, to: Point) {
    this.from = from;
    this.to = to;
    let x1 = from.x, x2 = to.x,
        y1 = from.y, y2 = to.y

    if(equals(x1, x2, 0.1)) {
      this.straight = new Straight(1, 0, x1 === -0? 0: -x1);
    } else {
      let a = (y1 - y2) / (x1 - x2)
      let b = y1 - a * x1
      this.straight = new Straight(equals(a, 0, 0.001)? 0: a, -1, b === -0? 0: b)
    }

    this.angle = Math.atan2(from.y - to.y, from.x - to.x)
  }

  public static fromCoords(x1: number, y1: number, x2: number, y2: number): Line {
    let from = new Point(Math.min(x1, x2), Math.min(y1, y2));
    let to = new Point(Math.max(x1, x2), Math.max(y1, y2));
    return new Line(from, to);
  }


  lineIntersection(line: Line): Point | null {
    let intersection = this.straight.intersection(line.straight);
    if(intersection == null) {
      return null
    }
    if(!(this.pointInLine(intersection) && line.pointInLine(intersection))) {
      return null
    }

    return intersection
  }

  pointInLine(point: Point): boolean {
    return point.x >= this.from.x - delta &&
      point.x <= this.to.x + delta &&
      point.y >= this.from.y - delta &&
      point.y <= this.to.y + delta
  }

  public equal(line: Line) {
    return this.to.x === line.to.x &&
      this.from.x === line.from.x &&
      this.to.y === line.to.y &&
      this.from.y === line.from.y;
  }

  intersectionAngle(line: Line): number {
    return Math.abs(this.angle) - Math.abs(line.angle)
    // let m1 = -(this.straight.A / this.straight.B),
    //     m2 = -(line.straight.A / line.straight.B),
    //     C1 = this.straight.C / this.straight.B,
    //     C2 = line.straight.C / line.straight.B
    // if(m1 === m2) {
    //   return Math.PI / 2
    // }
    // return  Math.atan(Math.abs((m2 - m1) / (1 + m1*m2)))
  }

}

let board: [number, number] = [400, 300]

export class Game {
  private readonly board: {w: number, h: number};
  private readonly playerSize = 100;
  private readonly minTime = 0.5;
  public readonly ball: Ball;
  private lastObstacle: Line = Line.fromCoords(-1000, -1000, 100, 100);
  public p1: number = 100
  public p2: number = 100

  private readonly straights: Line[] = [];

  constructor(board: { w: number; h: number }) {
    this.board = board;
    this.ball = new Ball(board.w/2, board.h/2, Math.PI/4);


    this.straights.push(Line.fromCoords(0,0, board.w, 0));
    this.straights.push(Line.fromCoords(0,0, 0, 100));
    this.straights.push(Line.fromCoords(0,board.h-100, 0, board.h));
    this.straights.push(Line.fromCoords(board.w, board.h, 0, board.h));
    this.straights.push(Line.fromCoords(board.w, 0, board.w, 100));
    this.straights.push(Line.fromCoords(board.w, board.h - 100, board.w, board.h));
  }

  public move(time: number): string {
    this.moveBall(this.straights.slice(0, this.straights.length), time);
    if(this.ball.x > this.board.w) {
      return "p1"
    } else if (this.ball.x < 0) {
      return "p2"
    } else {
      return ""
    }
  }

  public resetBall() {
    this.ball.x = this.board.w / 2;
    this.ball.y = this.board.h / 2;
    this.ball.angle = Math.random() * Math.PI * 2
  }

  public moveBall(straights: Line[], time: number) {
    straights.push(Line.fromCoords(10, this.p1, 10, this.p1 + 100))
    straights.push(Line.fromCoords(this.board.w - 10, this.p2, this.board.w - 10, this.p2 + 100))


    const ball = this.ball;
    let intersections: {l: Line, time: number, p: Point}[] = [];
    let ballLine = ball.createLine(time);

    for(let l of straights) {
      let point = l.lineIntersection(ballLine);
      if(!!point && !l.equal(this.lastObstacle)) {
        intersections.push({
          l: l,
          time: this.ball.timeToX(point.x, point.y),
          p: point
        });
      }
    }

    if(intersections.length === 0) {
      ball.move(time);
      return;
    }

    let intersection = intersections.sort(
      (i1, i2) => i1.time - i2.time)[0];

    if(intersection.time > time) {
      ball.move(time)
      return;
    }


    ball.move(intersection.time * 0.98);
    this.lastObstacle = intersection.l;
    let intersectionAngle = Math.abs(intersection.l.intersectionAngle(ballLine));
    console.log("wall angle: " + intersectionAngle)
    ball.changeAngle(intersectionAngle);
    console.log(ball.angle);

    let timeLeft = time - intersection.time;
    if(timeLeft < this.minTime) return;
    // let lines = straights.filter(l => l.equal(intersection.l));
    this.moveBall(straights, timeLeft);
  }

}

export class Ball {
  private readonly ballSpeed = 2;
  private _x: number;
  private _y: number;
  private _angle: number;

  constructor(x: number, y: number, angle: number) {
    this._x = x;
    this._y = y;
    this._angle = angle;
  }

  move(time: number) {
    this._x = this.calcX(time);
    this._y = this.calcY(time);
  }


  changeAngle(wallAngle: number) {
    let a = this._angle
    let angleMod: number;
    const delta = 20;
    if(a < Math.PI / 2 && equals(this._x, board[0], delta)) {
      angleMod = -1
      console.log('<90 x')
    } else if(a < Math.PI / 2 && equals(this._y, board[1], delta) ) {
      angleMod = 1
      console.log('<90 y')
    } else if(a < Math.PI && equals(this._x, 0, delta) ) {
      angleMod = 1
      console.log('<180 x')
    } else if(a < Math.PI && equals(this._y, board[1], delta) ) {
      angleMod = -1
      console.log('<180 y')
    } else if(a < Math.PI * 1.5 && equals(this._x, 0, delta) ) {
      angleMod = -1
      console.log('<270 x')
    } else if(a < Math.PI * 1.5 && equals(this._y, 0, delta) ) {
      angleMod = 1
      console.log('<270 y')
    } else if(equals(this._x, board[0], 3)) {
      angleMod = 1
      console.log('<360 x')
    } else {
      angleMod = -1
      console.log('<360 y')
    }

    this._angle = this._angle - angleMod * wallAngle * 2;
    if(this._angle > Math.PI * 2) {
      this._angle = this._angle - Math.PI * 2
    } else if(this._angle < 0) {
      this._angle = this._angle + Math.PI * 2
    }
  }

  timeToX(x: number, y: number): number {
    if(equals(this._x, x, 0.1)) {
      return Math.abs(y - this._y) / (Math.sin(this._angle) * this.ballSpeed)
    }

    return Math.abs(x - this._x) / (Math.cos(this._angle) * this.ballSpeed);
  }

  createLine(time: number): Line {
    return Line.fromCoords(this._x, this._y, this.calcX(time), this.calcY(time));
  }

  calcX(time: number): number {
    return Math.cos(this._angle) * this.ballSpeed * time + this._x;
  }

  calcY(time: number): number {
    return Math.sin(this._angle) * this.ballSpeed * time + this._y;
  }

  get x(): number {
    return this._x;
  }

  get y(): number {
    return this._y;
  }


  set x(value: number) {
    this._x = value;
  }

  set y(value: number) {
    this._y = value;
  }

  get angle(): number {
    return this._angle;
  }


  set angle(value: number) {
    this._angle = value;
  }
}