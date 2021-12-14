import {GameState} from "./GameState";

export class Point {
  public readonly x: number;
  public readonly y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}

class Straight {
  public readonly a: number;
  public readonly b: number;

  constructor(a: number, b: number) {
    this.a = a;
    this.b = b;
  }
}

const delta = 10;

export class Line {
  public readonly from: Point;
  public readonly to: Point;
  public readonly straight: Straight;


  constructor(x1: number, y1: number, x2: number, y2: number) {
    this.from = new Point(Math.min(x1, x2), Math.min(y1, y2));
    this.to = new Point(Math.max(x1, x2), Math.max(y1, y2));
    // let a = (y1 - y2) / (x1 - x2);
    // debugger;
    let a = (this.from.y - this.to.y) / (this.from.x - this.to.x);
    if(isNaN(a) || a === Infinity) {
      a = 10_000;
    } else if(a === -Infinity) {
      a = -10_000;
    } else if (a === -0) {
      a = 0;
    }
    let b = y1 - x1 * a;
    if(b === -0) {
      b = 0
    }
    this.straight = new Straight(a, b);
  }

  intersection(straight: Straight): Point | undefined {
    let x = (straight.b - this.straight.b) / (straight.a - this.straight.a);
    let y = x *  straight.a + straight.b;
    if(x <= this.to.x && x >= this.from.x) {
      return new Point(x, y);
    }

    return undefined;
  }

  lineIntersection(line: Line): Point | undefined {
    const straight = line.straight;
    let x = (this.straight.b - straight.b) / (straight.a - this.straight.a);
    let y = x *  straight.a + straight.b;

    if(x <= this.to.x + 10 && x >= this.from.x - 10 &&
       x <= line.to.x + 10 && x >= line.from.x - 10) {
      return new Point(x, y);
    }

    return undefined;
  }

  intersectionAngle(line: Line): number {
    let a1 = line.straight.a;
    let a2 = this.straight.a;
    let b1 = line.straight.b;
    let b2 = this.straight.b;

    return Math.atan((a2*b1 - a1*b2) / (a1*a2 + b1*b2));
  }

  calcAngle(): number {
    // if(isNaN(this.straight.a)) return Math.PI / 2;
    let a = this.straight.a;
    let b = this.straight.b;
    let cLength = Math.sqrt(Math.pow(a+b,2) + 1);
    // Math.acos()
    return Math.acos(1/cLength);
  }

  equal(line: Line): boolean {
    return this.from.x === line.from.x && this.from.y === line.from.y &&
      this.to.x === line.to.x && this.to.y === line.to.y;
  }

}

export class Game {
  private readonly board: {w: number, h: number};
  private readonly playerSize = 100;
  private readonly minTime = 0.5;
  public readonly ball: Ball;
  private lastObstacle: Line = new Line(-1000, -1000, 100, 100);

  private readonly straights: Line[] = [];

  constructor(board: { w: number; h: number }) {
    this.board = board;
    this.ball = new Ball(board.w/2, board.h/2, Math.PI);


    this.straights.push(new Line(0,0, board.w, 0));
    this.straights.push(new Line(0,0, 0, board.h));
    this.straights.push(new Line(board.w, board.h, 0, board.h));
    this.straights.push(new Line(board.w, board.h, board.w, 0));
  }

  public move(time: number) {
    this.moveBall(this.straights, time);
  }

  public moveBall(straights: Line[], time: number) {
    // debugger;
    const ball = this.ball;
    let intersections: {l: Line, time: number}[] = [];
    let ballLine = ball.createLine(time);

    for(let l of straights) {
      let point = l.lineIntersection(ballLine);
      if(!!point && !l.equal(this.lastObstacle)) {
        intersections.push({l: l, time: this.ball.timeToX(point.x)});
      }
    }

    if(intersections.length === 0) {
      ball.move(time);
      return;
    }

    let intersection = intersections.sort(
      (i1, i2) => i1.time - i2.time)[0];

    ball.move(intersection.time);
    this.lastObstacle = intersection.l;
    ball.changeAngle(intersection.l.intersectionAngle(ballLine));

    if(time > this.minTime) return;
    let lines = straights.filter(l => l.equal(intersection.l));
    this.moveBall(lines, time - intersection.time);
  }

}

export class Ball {
  private readonly ballSpeed = 20;
  private _x: number;
  private _y: number;
  private angle: number;

  constructor(x: number, y: number, angle: number) {
    this._x = x;
    this._y = y;
    this.angle = angle;
  }

  move(time: number) {
    this._x = this.calcX(time);
    this._y = this.calcY(time);
    // console.log(this._x, this._y);
  }


  changeAngle(wallAngle: number) {
    this.angle = this.angle - wallAngle * 2;
  }

  timeToX(x: number): number {
    return (x - this._x) / (Math.cos(this.angle) * this.ballSpeed);
  }

  createLine(time: number): Line {
    return new Line(this._x, this._y, this.calcX(time), this.calcY(time));
  }

  calcX(time: number): number {
    return Math.cos(this.angle) * this.ballSpeed * time + this._x;
  }

  calcY(time: number): number {
    return Math.sin(this.angle) * this.ballSpeed * time + this._y;
  }

  get x(): number {
    return this._x;
  }

  get y(): number {
    return this._y;
  }
}