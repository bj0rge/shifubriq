import Game, { Status, Move } from '../game';

describe('Games', () => {
  let game: Game;
  let gameId: string;
  let userId: string;
  let otherUserId: string;

  beforeAll(() => {
    gameId = 'gameId';
    otherUserId = 'otherUserId';
    userId = 'userId';
  });
  beforeEach(() => {
    game = new Game(gameId, userId);
  });

  describe('constructor', () => {
    describe('given a brand new game', () => {
      it('has starting parameters', () => {
        expect(game.status).toBe(Status.Started);
        expect(game.moves).toEqual({});
      });
    });
  });

  describe('addUser()', () => {
    describe('on an ended game', () => {
      it('says the game has ended', () => {
        game.endGame();
        const addUserResult = game.addUser(otherUserId);
        expect(addUserResult.outcome).toBe('not_added');
        if (addUserResult.outcome === 'not_added') {
          expect(addUserResult.reason).toBe('game_ended');
        }
      });
    });
    describe("that has, we don't know why, no player", () => {
      it('says that there is no user in game', () => {
        game.usersIds = [];
        const addUserResult = game.addUser(otherUserId);
        expect(addUserResult.outcome).toBe('not_added');
        if (addUserResult.outcome === 'not_added') {
          expect(addUserResult.reason).toBe('no_user_in_game');
        }
      });
    });
    describe('that already has 2 players', () => {
      it('says that there is no user in the game', () => {
        game.addUser(otherUserId);
        const addUserResult = game.addUser('anotherUserId');
        expect(addUserResult.outcome).toBe('not_added');
        if (addUserResult.outcome === 'not_added') {
          expect(addUserResult.reason).toBe('game_full');
        }
      });
    });
    describe('that already is in the game', () => {
      it('says that the user is already in the game', () => {
        const addUserResult = game.addUser(userId);
        expect(addUserResult.outcome).toBe('not_added');
        if (addUserResult.outcome === 'not_added') {
          expect(addUserResult.reason).toBe('user_already_in_game');
        }
      });
    });
    describe('when everything went fine', () => {
      it('ends up well', () => {
        const addUserResult = game.addUser(otherUserId);
        expect(addUserResult.outcome).toBe('added');
      });
    });
  });

  describe('playMove()', () => {
    describe('when game is ended', () => {
      it('says that the game ended', () => {
        game.endGame();
        const playMoveResult = game.playMove(userId, Move.Paper);
        expect(playMoveResult.outcome).toBe('move_not_played');
        if (playMoveResult.outcome === 'move_not_played') {
          expect(playMoveResult.reason).toBe('game_ended');
        }
      });
    });
    describe('when game is ongoing', () => {
      let userMove;
      beforeEach(() => {
        userMove = Move.Scissors;
        game.playMove(userId, userMove);
      });
      describe("when user 2 wasn't added", () => {
        it('says that a user were not added', () => {
          const playMoveResult = game.playMove('anotherUserId', Move.Rock);
          expect(playMoveResult.outcome).toBe('move_not_played');
          if (playMoveResult.outcome === 'move_not_played') {
            expect(playMoveResult.reason).toEqual('user_not_added');
          }
        });
      });
      describe('when user 2 was added', () => {
        beforeEach(() => {
          game.addUser(otherUserId);
        });
        describe('when player already played', () => {
          it('says that player already played', () => {
            const playMoveResult = game.playMove(userId, userMove);
            expect(playMoveResult.outcome).toBe('move_not_played');
            if (playMoveResult.outcome === 'move_not_played') {
              expect(playMoveResult.reason).toBe('user_already_played_move');
            }
          });
        });
        describe('when all players already played', () => {
          it('says that all players already played', () => {
            game.playMove(otherUserId, userMove);
            const playMoveResult = game.playMove('anotherUserId', userMove);
            expect(playMoveResult.outcome).toBe('move_not_played');
            if (playMoveResult.outcome === 'move_not_played') {
              expect(playMoveResult.reason).toBe('all_players_played');
            }
          });
        });
        describe('when everything went fine', () => {
          it('ends up well', () => {
            const playMoveResult = game.playMove(otherUserId, Move.Rock);
            expect(playMoveResult.outcome).toBe('move_played');
            if (playMoveResult.outcome === 'move_played') {
              expect(playMoveResult.moves).toEqual({
                [otherUserId]: Move.Rock,
                [userId]: userMove,
              });
            }
          });
        });
      });
    });
  });

  describe('resolveGame()', () => {
    describe('when trying to resolve a game that has ended', () => {
      it('says that the game ended', () => {
        game.endGame();
        const resolveGameResult = game.resolveGame();
        expect(resolveGameResult.outcome).toBe('game_not_resolved');
        if (resolveGameResult.outcome === 'game_not_resolved') {
          expect(resolveGameResult.reason).toBe('game_ended');
        }
      });
    });
    describe('when player 2 did not move yet', () => {
      it('says that not all users played', () => {
        game.playMove(userId, Move.Paper);
        const resolveGameResult = game.resolveGame();
        expect(resolveGameResult.outcome).toBe('game_not_resolved');
        if (resolveGameResult.outcome === 'game_not_resolved') {
          expect(resolveGameResult.reason).toBe('not_all_users_played');
        }
      });
    });
    describe('when both players played', () => {
      beforeEach(() => {
        game.addUser(otherUserId);
      });
      describe('an unknown move', () => {
        it('says that the move is unknown', () => {
          game.playMove(userId, Move.Paper);
          game.playMove(otherUserId, null);
          const resolveGameResult = game.resolveGame();
          expect(resolveGameResult.outcome).toBe('game_not_resolved');
          if (resolveGameResult.outcome === 'game_not_resolved') {
            expect(resolveGameResult.reason).toBe('unknown_move');
          }
        });
      });
      describe('when user 1 moved', () => {
        describe('paper', () => {
          beforeEach(() => {
            game.playMove(userId, Move.Paper);
          });
          describe('and user 2 moved paper too', () => {
            it('is a tie', () => {
              game.playMove(otherUserId, Move.Paper);
              const resolveGameResult = game.resolveGame();
              expect(resolveGameResult.outcome).toBe('no_winner');
            });
          });
          describe('and user 2 moved scisors', () => {
            it('made user 2 win', () => {
              game.playMove(otherUserId, Move.Scissors);
              const resolveGameResult = game.resolveGame();
              expect(resolveGameResult.outcome).toBe('winner');
              if (resolveGameResult.outcome === 'winner') {
                expect(resolveGameResult.gameResult).toEqual({
                  winnerId: otherUserId,
                  loserId: userId,
                  move: Move.Scissors,
                });
              }
            });
          });
          describe('and user 2 moved rock', () => {
            it('made user 1 win', () => {
              game.playMove(otherUserId, Move.Rock);
              const resolveGameResult = game.resolveGame();
              expect(resolveGameResult.outcome).toBe('winner');
              if (resolveGameResult.outcome === 'winner') {
                expect(resolveGameResult.gameResult).toEqual({
                  winnerId: userId,
                  loserId: otherUserId,
                  move: Move.Paper,
                });
              }
            });
          });
        });

        describe('rock', () => {
          beforeEach(() => {
            game.playMove(userId, Move.Rock);
          });
          describe('and user 2 moved rock too', () => {
            it('is a tie', () => {
              game.playMove(otherUserId, Move.Rock);
              const resolveGameResult = game.resolveGame();
              expect(resolveGameResult.outcome).toBe('no_winner');
            });
          });
          describe('and user 2 moved paper', () => {
            it('made user 2 win', () => {
              game.playMove(otherUserId, Move.Paper);
              const resolveGameResult = game.resolveGame();
              expect(resolveGameResult.outcome).toBe('winner');
              if (resolveGameResult.outcome === 'winner') {
                expect(resolveGameResult.gameResult).toEqual({
                  winnerId: otherUserId,
                  loserId: userId,
                  move: Move.Paper,
                });
              }
            });
          });
          describe('and user 2 moved scissors', () => {
            it('made user 1 win', () => {
              game.playMove(otherUserId, Move.Scissors);
              const resolveGameResult = game.resolveGame();
              expect(resolveGameResult.outcome).toBe('winner');
              if (resolveGameResult.outcome === 'winner') {
                expect(resolveGameResult.gameResult).toEqual({
                  winnerId: userId,
                  loserId: otherUserId,
                  move: Move.Rock,
                });
              }
            });
          });
        });

        describe('scissors', () => {
          beforeEach(() => {
            game.playMove(userId, Move.Scissors);
          });
          describe('and user 2 moved scissors too', () => {
            it('is a tie', () => {
              game.playMove(otherUserId, Move.Scissors);
              const resolveGameResult = game.resolveGame();
              expect(resolveGameResult.outcome).toBe('no_winner');
            });
          });
          describe('and user 2 moved rock', () => {
            it('made user 2 win', () => {
              game.playMove(otherUserId, Move.Rock);
              const resolveGameResult = game.resolveGame();
              expect(resolveGameResult.outcome).toBe('winner');
              if (resolveGameResult.outcome === 'winner') {
                expect(resolveGameResult.gameResult).toEqual({
                  winnerId: otherUserId,
                  loserId: userId,
                  move: Move.Rock,
                });
              }
            });
          });
          describe('and user 2 moved paper', () => {
            it('made user 1 win', () => {
              game.playMove(otherUserId, Move.Paper);
              const resolveGameResult = game.resolveGame();
              expect(resolveGameResult.outcome).toBe('winner');
              if (resolveGameResult.outcome === 'winner') {
                expect(resolveGameResult.gameResult).toEqual({
                  winnerId: userId,
                  loserId: otherUserId,
                  move: Move.Scissors,
                });
              }
            });
          });
        });
      });
    });
  });
});
