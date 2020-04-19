export enum Status {
  Started = 'started',
  Ended = 'ended',
}

export enum Move {
  Rock = 'rock',
  Paper = 'paper',
  Scissors = 'scissors',
}

type Moves = { [userId: string]: Move };

type AddUserResult =
  | { outcome: 'added' }
  | { outcome: 'not_added'; reason: 'game_ended' }
  | { outcome: 'not_added'; reason: 'no_user_in_game' }
  | { outcome: 'not_added'; reason: 'game_full' }
  | { outcome: 'not_added'; reason: 'user_already_in_game' };

type PlayMoveResult =
  | { outcome: 'move_played'; moves: Moves }
  | { outcome: 'move_not_played'; reason: 'game_ended' }
  | { outcome: 'move_not_played'; reason: 'user_already_played_move' }
  | { outcome: 'move_not_played'; reason: 'all_players_played' }
  | { outcome: 'move_not_played'; reason: 'user_not_added' };

type GameResult = {
  winnerId: string;
  loserId: string;
  move: Move;
};

type ResolveGameResult =
  | { outcome: 'winner'; gameResult: GameResult }
  | { outcome: 'no_winner' }
  | { outcome: 'game_not_resolved'; reason: 'game_ended' }
  | { outcome: 'game_not_resolved'; reason: 'not_all_users_played' }
  | { outcome: 'game_not_resolved'; reason: 'unknown_move' };

export default class Game {
  gameId: string;
  usersIds: string[];
  status: Status;
  moves: Moves;
  constructor(gameId: string, userId: string) {
    this.gameId = gameId;
    this.usersIds = [userId];
    this.status = Status.Started;
    this.moves = {};
  }

  private isOngoing(): boolean {
    return this.status === Status.Started;
  }

  // only for tests purpose
  // removeAllUsers()

  public addUser(userId: string): AddUserResult {
    const { usersIds } = this;
    if (!this.isOngoing()) {
      return { outcome: 'not_added', reason: 'game_ended' };
    }

    if (usersIds.length === 0) {
      return {
        outcome: 'not_added',
        reason: 'no_user_in_game',
      };
    }
    if (usersIds.length > 1) {
      return {
        outcome: 'not_added',
        reason: 'game_full',
      };
    }

    const isAlreadyInGame = usersIds[0] === userId;
    if (isAlreadyInGame) {
      return {
        outcome: 'not_added',
        reason: 'user_already_in_game',
      };
    }

    usersIds.push(userId);
    return { outcome: 'added' };
  }

  playMove(userId: string, move: Move): PlayMoveResult {
    if (!this.isOngoing()) {
      return { outcome: 'move_not_played', reason: 'game_ended' };
    }

    if (this.moves[userId]) {
      return { outcome: 'move_not_played', reason: 'user_already_played_move' };
    }

    if (Object.keys(this.moves).length > 1) {
      return { outcome: 'move_not_played', reason: 'all_players_played' };
    }

    if (!this.usersIds.includes(userId)) {
      return { outcome: 'move_not_played', reason: 'user_not_added' };
    }

    this.moves[userId] = move;
    return { outcome: 'move_played', moves: this.moves };
  }

  resolveGame(): ResolveGameResult {
    if (!this.isOngoing()) {
      return { outcome: 'game_not_resolved', reason: 'game_ended' };
    }

    const { moves, usersIds } = this;
    if (Object.keys(moves).length < 2) {
      return { outcome: 'game_not_resolved', reason: 'not_all_users_played' };
    }

    const user1 = usersIds[0];
    const user2 = usersIds[1];
    const move1 = moves[user1];
    const move2 = moves[user2];
    if (move1 === move2) {
      return { outcome: 'no_winner' };
    }

    let gameResult: GameResult;
    if (move1 === Move.Paper) {
      if (move2 === Move.Rock) {
        gameResult = { winnerId: user1, loserId: user2, move: Move.Paper };
      } else if (move2 === Move.Scissors) {
        gameResult = { winnerId: user2, loserId: user1, move: Move.Scissors };
      }
    } else if (move1 === Move.Scissors) {
      if (move2 === Move.Rock) {
        gameResult = { winnerId: user2, loserId: user1, move: Move.Rock };
      } else if (move2 === Move.Paper) {
        gameResult = { winnerId: user1, loserId: user2, move: Move.Scissors };
      }
    } else if (move1 === Move.Rock) {
      if (move2 === Move.Scissors) {
        gameResult = { winnerId: user1, loserId: user2, move: Move.Rock };
      } else if (move2 === Move.Paper) {
        gameResult = { winnerId: user2, loserId: user1, move: Move.Paper };
      }
    }

    if (!gameResult) {
      return { outcome: 'game_not_resolved', reason: 'unknown_move' };
    }
    return { outcome: 'winner', gameResult };
  }

  endGame() {
    this.status = Status.Ended;
  }
}
