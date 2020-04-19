import * as Slack from '../providers/slack';
import { wait } from '../utils/wait';
import { Move } from './games';
import config from '../config';

const WAITING_TIME_IN_MILLISECONDS = 500;

type User = {
  id: string;
  name: string;
};

export async function sendGameCreated(
  initiator: User,
  opponent: User,
): Promise<void> {
  await Promise.all([
    Slack.postMessage(
      `Hey! <@${initiator.id}|${initiator.name}> just launched a Shifubriq! <@${opponent.id}|${opponent.name}>, join the game by typing \`/shifubriq <@${initiator.id}|${initiator.name}>\``,
      opponent.id,
    ),
    Slack.postMessage(
      `Waiting for <@${opponent.id}|${opponent.name}> to accept the Shifubriq`,
      initiator.id,
    ),
  ]);
}

export async function sendActionPrompts(
  usersIds: string[],
  gameId: string,
): Promise<void> {
  await Slack.postMessages('Shi…', usersIds);
  await wait(WAITING_TIME_IN_MILLISECONDS);
  await Slack.postMessages('Fu…', usersIds);
  await wait(WAITING_TIME_IN_MILLISECONDS);
  const attachments = [
    {
      text: "What's your move?",
      fallback: 'You are unable to choose a game',
      callback_id: gameId,
      color: '#3AA3E3',
      attachment_type: 'default',
      actions: [
        {
          name: 'game',
          text: '✊',
          type: 'button',
          value: Move.Rock,
        },
        {
          name: 'game',
          text: '✋',
          type: 'button',
          value: Move.Paper,
        },
        {
          name: 'game',
          text: '✌️',
          type: 'button',
          value: Move.Scissors,
        },
      ],
    },
  ];
  await Slack.postMessages('Briq!', usersIds, attachments);
}

export async function sendTieResult(usersIds: string[]): Promise<void> {
  await Slack.postMessages("It's a tie ! Play again ! 😂🤣🙃", usersIds);
}

export async function sendWinnerResult(
  winner: User,
  loser: User,
): Promise<void> {
  await Promise.all([
    Slack.postMessage(
      `You won 🤗🎉! You just stole ${config.briqTransaction.amount}${config.briqTransaction.currency} to <@${loser.id}|${loser.name}>`,
      winner.id,
    ),
    Slack.postMessage(
      `Sorry, you lose 😕… <@${winner.id}|${winner.name}> just stole you ${config.briqTransaction.amount}${config.briqTransaction.currency}!`,
      loser.id,
    ),
  ]);
}
