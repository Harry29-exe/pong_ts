export class GameState {
  private player1: number;
  private player2: number;
  private ballX: number;
  private ballY: number;
  private angleRad: number;

  constructor(player1: number, player2: number, ballX: number, ballY: number, angleRad: number) {
    this.player1 = player1;
    this.player2 = player2;
    this.ballX = ballX;
    this.ballY = ballY;
    this.angleRad = angleRad;
  }

}