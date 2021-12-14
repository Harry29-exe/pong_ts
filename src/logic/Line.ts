import {Point} from "./Point";

class Straight {
  public readonly a: number;
  public readonly b: number;

  constructor(a: number, b: number) {
    this.a = a;
    this.b = b;
  }
}

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
    if (isNaN(a) || a === Infinity) {
      a = 10_000;
    } else if (a === -Infinity) {
      a = -10_000;
    } else if (a === -0) {
      a = 0;
    }
    let b = y1 - x1 * a;
    if (b === -0) {
      b = 0
    }
    this.straight = new Straight(a, b);
  }

  intersection(straight: Straight): Point | undefined {
    let x = (straight.b - this.straight.b) / (straight.a - this.straight.a);
    let y = x * straight.a + straight.b;
    if (x <= this.to.x && x >= this.from.x) {
      return new Point(x, y);
    }

    return undefined;
  }

  lineIntersection(line: Line): Point | undefined {
    const straight = line.straight;
    let x = (this.straight.b - straight.b) / (straight.a - this.straight.a);
    let y = x * straight.a + straight.b;

    if (x <= this.to.x + 1 && x >= this.from.x - 1 &&
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

    return Math.atan((a2 * b1 - a1 * b2) / (a1 * a2 + b1 * b2));
  }

  calcAngle(): number {
    // if(isNaN(this.straight.a)) return Math.PI / 2;
    let a = this.straight.a;
    let b = this.straight.b;
    let cLength = Math.sqrt(Math.pow(a + b, 2) + 1);
    // Math.acos()
    return Math.acos(1 / cLength);
  }

  equal(line: Line): boolean {
    return this.from.x === line.from.x && this.from.y === line.from.y &&
      this.to.x === line.to.x && this.to.y === line.to.y;
  }

}