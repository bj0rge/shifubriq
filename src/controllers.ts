import * as ServiceShifubriq from './services/shifubriq';
import { expectIncomingTokenToBeLegit } from './utils/verificationToken';

export async function initiateShifubriqGame(req, res) {
  const {
    user_id: launcherId,
    text,
    token,
  }: {
    user_id: string;
    token: string;
    text: string;
  } = req.body;

  expectIncomingTokenToBeLegit(token);

  const initiateShifubriqGameResult = await ServiceShifubriq.initiateShifubriqGame(
    launcherId,
    text,
  );

  if (initiateShifubriqGameResult.outcome === 'game_not_initiated') {
    switch (initiateShifubriqGameResult.reason) {
      case 'no_receiver_id':
        return res.send('No receiver id');
      case 'no_argument':
        return res.send(
          'You need to add the username, try `/shifubriq @username`',
        );
      case 'no_user_name':
        return res.send(
          `\`${text}\` is not a valid username, try \`/shifubriq @username\``,
        );
      case 'too_many_arguments':
        return res.send(
          'Shifubriq cannot understand the username, too many arguments; try `/shifubriq @username`',
        );
      case 'still_waiting':
        return res.send('Still waiting');
      default:
        throw new Error(
          `Unknown reason when initiating game:\n${JSON.stringify(
            initiateShifubriqGameResult,
          )}`,
        );
    }
  } else if (initiateShifubriqGameResult.outcome === 'game_initiated') {
    return res.send();
  }
  res.status(400).send('An error occured');
}

export async function play(req, res) {
  expectIncomingTokenToBeLegit(req.body.token);

  const payload = JSON.parse(req.body.payload);

  const action = payload.actions[0];
  const userId = payload.user.id;
  const gameId = payload.callback_id;

  const playShifubriqGameResult = await ServiceShifubriq.playShifubriqGame(
    gameId,
    userId,
    action,
  );

  switch (playShifubriqGameResult.outcome) {
    case 'not_played':
      if (playShifubriqGameResult.reason === 'unknown_action') {
        return res.send('Unknown action ¯\\_(ツ)_/¯');
      }
      throw new Error(
        `Unknown reason when playing move:\n${JSON.stringify(
          playShifubriqGameResult,
        )}`,
      );
    case 'pending':
      return res.send("Thanks. I'm waiting for the other player");
    case 'tie':
    case 'win':
      return res.send('Thanks. And the result is…');
    default:
      throw new Error(
        `Unknown outcome when playing move:\n${JSON.stringify(
          playShifubriqGameResult,
        )}`,
      );
  }
}
