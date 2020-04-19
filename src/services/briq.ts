import * as Briq from '../providers/briq';
import * as Slack from '../providers/slack';
import config from '../config';

export async function transferBriqs(loserName: string, winnerName: string) {
  const team = await Slack.getTeamInfo();
  const organizationName = team.name;
  const transaction = {
    amount: config.briqTransaction.amount,
    comment: 'You win bro!! ✊✋✌️',
    app: 'shifubriq',
    from: loserName,
    to: winnerName,
  };
  await Briq.transferBriqs(transaction, organizationName);
}
