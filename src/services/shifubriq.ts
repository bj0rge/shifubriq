import * as ServiceUser from './user';
import * as ServiceMessaging from './messaging';
import * as ServiceBriq from './briq';
import Games, { Move } from './games';
import Game from './games/game';

const games = Games.getInstance();

const USERNAME_REGEX = /<@([^|]*)\|([^>]*)>/;

type GetUsernameFromStringResult =
  | { outcome: 'not_found'; reason: 'no_argument' }
  | { outcome: 'not_found'; reason: 'too_many_arguments' }
  | { outcome: 'not_found'; reason: 'no_user_name' }
  | { outcome: 'found'; opponent: { id: string; name: string } };

function getUsernameFromString(text: string): GetUsernameFromStringResult {
  if (text.trim() === '') {
    return { outcome: 'not_found', reason: 'no_argument' };
  }

  const splittedText = text.split(' ');
  if (splittedText.length > 1) {
    return { outcome: 'not_found', reason: 'too_many_arguments' };
  }

  const usernameMatch = splittedText[0].match(USERNAME_REGEX);
  if (!usernameMatch) {
    return { outcome: 'not_found', reason: 'no_user_name' };
  }

  return {
    outcome: 'found',
    opponent: { id: usernameMatch[1], name: usernameMatch[2] },
  };
}

async function createGame(
  initiatorId: string,
  opponentId: string,
  gameId: string,
): Promise<void> {
  const [initiatorName, opponentName] = await ServiceUser.getUsersNames([
    initiatorId,
    opponentId,
  ]);
  games.initiateGame(gameId, initiatorId);
  await ServiceMessaging.sendGameCreated(
    { id: initiatorId, name: initiatorName },
    { id: opponentId, name: opponentName },
  );
}

type JoinGameResult = { outcome: 'still_waiting' } | { outcome: 'game_joined' };
async function joinGame(game: Game, joinerId: string): Promise<JoinGameResult> {
  const { usersIds } = game;
  if (usersIds[0] === joinerId) {
    return { outcome: 'still_waiting' };
  }

  const addUserResult = game.addUser(joinerId);
  if (addUserResult.outcome === 'not_added') {
    // FIXME: emit a slack message
    throw new Error(`User not added: ${addUserResult.reason}`);
  }

  // Not awaiting due to timeouting
  ServiceMessaging.sendActionPrompts(usersIds, game.gameId);
  return { outcome: 'game_joined' };
}

type InitiateShifubriqGameResult =
  | { outcome: 'game_initiated' }
  | { outcome: 'game_not_initiated'; reason: 'still_waiting' }
  | { outcome: 'game_not_initiated'; reason: 'no_receiver_id' }
  | { outcome: 'game_not_initiated'; reason: 'no_user_name' }
  | { outcome: 'game_not_initiated'; reason: 'too_many_arguments' }
  | { outcome: 'game_not_initiated'; reason: 'no_argument' };

export async function initiateShifubriqGame(
  initiatorId: string,
  text: string,
): Promise<InitiateShifubriqGameResult> {
  const getUsernameFromStringResult = getUsernameFromString(text);
  if (getUsernameFromStringResult.outcome === 'not_found') {
    return {
      outcome: 'game_not_initiated',
      reason: getUsernameFromStringResult.reason,
    };
  }

  const { opponent } = getUsernameFromStringResult;

  const gameId = Games.computeGameId(initiatorId, opponent.id);
  const game = games.getGame(gameId);
  if (!game) {
    await createGame(initiatorId, opponent.id, gameId);
  } else {
    const joinGameResult = await joinGame(game, initiatorId);
    if (joinGameResult.outcome === 'still_waiting') {
      return { outcome: 'game_not_initiated', reason: 'still_waiting' };
    }
  }

  return { outcome: 'game_initiated' };
}

type PlayShifubriqGameResult =
  | { outcome: 'tie' }
  | { outcome: 'win'; status: { winnerName: string; loserName: string } }
  | { outcome: 'not_played'; reason: 'unknown_action' }
  | { outcome: 'pending' };

export async function playShifubriqGame(
  gameId: string,
  userId: string,
  action: { name: string; value: Move },
): Promise<PlayShifubriqGameResult> {
  if (action.name !== 'game') {
    return { outcome: 'not_played', reason: 'unknown_action' };
  }
  const game = games.getGame(gameId);
  const move = action.value;
  const playMoveResult = game.playMove(userId, move);
  if (playMoveResult.outcome === 'move_not_played') {
    // FIXME: emit a slack message
    throw new Error(`Move not played: ${playMoveResult.reason}`);
  }
  const { moves } = playMoveResult;

  if (Object.keys(moves).length === 1) {
    return { outcome: 'pending' };
  }

  // Game ended, send results
  const resolveGameResult = game.resolveGame();
  if (resolveGameResult.outcome === 'game_not_resolved') {
    // FIXME: emit a slack message
    throw new Error(`Game not resolved: ${resolveGameResult.reason}`);
  }

  if (resolveGameResult.outcome === 'no_winner') {
    // return tie
    games.endGame(game);
    ServiceMessaging.sendTieResult(game.usersIds);
    return { outcome: 'tie' };
  } else {
    // winner
    games.endGame(game);
    const [winnerName, loserName] = await ServiceUser.getUsersNames([
      resolveGameResult.gameResult.winnerId,
      resolveGameResult.gameResult.loserId,
    ]);

    // Not awaiting to avoid timeouts
    if (process.env.NODE_ENV === 'production') {
      ServiceBriq.transferBriqs(loserName, winnerName);
    }
    ServiceMessaging.sendWinnerResult(
      { id: resolveGameResult.gameResult.winnerId, name: winnerName },
      { id: resolveGameResult.gameResult.loserId, name: loserName },
    );

    return { outcome: 'win', status: { winnerName, loserName } };
  }
}
