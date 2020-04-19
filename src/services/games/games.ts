import Game from './game';
type GamesList = Map<string, Game>;

export default class Games {
  private static _instance: Games = new Games();
  private _gamesList: GamesList = new Map();

  constructor() {
    if (Games._instance) {
      throw new Error(
        'Error: Instantiation failed: Use Games.getInstance() instead of new.',
      );
    }
    Games._instance = this;
  }

  public static computeGameId(userId1: string, userId2: string): string {
    return [userId1, userId2].sort().join('-');
  }

  public static getInstance(): Games {
    return Games._instance;
  }

  public getGame(id: string): Game {
    return this._gamesList.get(id);
  }

  public initiateGame(id: string, userId: string): Game {
    const existingGame = this.getGame(id);
    if (existingGame) {
      throw new Error(`A game already exists for this id: ${id}`);
    }
    const game: Game = new Game(id, userId);
    this._gamesList.set(id, game);
    return game;
  }

  public endGame(game: Game): void {
    game.endGame();
    this._gamesList.delete(game.gameId);
  }
}
