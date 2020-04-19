export default {
  env: {
    port: 8085,
  },
  briqTransaction: {
    amount: 1,
    currency: 'bq',
  },
  slack: {
    token: 'token-example',
    verificationToken: 'token-example',
    baseUrl: 'https://slack.com/api',
    commands: {
      listUsers: '/users.list',
      openConv: '/conversations.open',
      postMessage: '/chat.postMessage',
      teamInfo: '/team.info',
    },
  },
  briq: {
    token: 'token-example',
    baseUrl: 'https://api.givebriq.com/v0',
  },
};
