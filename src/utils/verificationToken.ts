import config from '../config';

export function expectIncomingTokenToBeLegit(incomingToken: string): void {
  const isVerificationToken = incomingToken === config.slack.verificationToken;
  if (!isVerificationToken) {
    throw new Error('Wrong verification token');
  }
}
