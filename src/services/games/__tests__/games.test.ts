import Games from '../games';
import Game, { Status } from '../game';

describe('Games', () => {
  let games: Games;
  beforeAll(() => {
    games = Games.getInstance();
  });
  describe('given an instance of Games', () => {
    it('is a singleton', () => {
      const otherInstance = Games.getInstance();
      expect(games).toBe(otherInstance);
    });
  });

  describe('#computeGameId', () => {
    describe('given 2 usersIds', () => {
      it('always returns the same id whatever the ids order is', () => {
        const userId1 = 'abc';
        const userId2 = 'def';
        expect(Games.computeGameId(userId2, userId1)).toBe(
          `${userId1}-${userId2}`,
        );
        expect(Games.computeGameId(userId1, userId2)).toBe(
          Games.computeGameId(userId2, userId1),
        );
      });
    });
  });

  describe('getGame()', () => {
    describe('given a game', () => {
      let gameId: string;
      let game: Game;
      beforeAll(() => {
        gameId = 'gameId';
        game = games.initiateGame(gameId, 'userId');
      });
      describe('initiated', () => {
        describe('when trying to create one with the same id', () => {
          it('fails', () => {
            expect(() => games.initiateGame(gameId, 'otherUserId')).toThrow();
          });
        });
        describe("when it's the only one with this id", () => {
          it('finds it', () => {
            const foundGame = games.getGame(gameId);
            expect(game).toBe(foundGame);
          });
        });
      });

      describe('destroyed', () => {
        beforeAll(() => {
          games.endGame(game);
        });
        it('does not find it', () => {
          const foundGame = games.getGame(gameId);
          expect(foundGame).toBeUndefined();
        });

        it('ends the game', () => {
          expect(game.status).toBe(Status.Ended);
        });
      });
    });
  });
});
