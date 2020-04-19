# Shifubriq

## What is this?

Shifubriq is a game you can play on Slack thanks to [briq](https://www.givebriq.com/). By launching the command `/shifubriq @user` you'll start a shifubriq game.
The other player is able to launch the same command to join it, and the winner steals 1 briq to the loser 🙃

## How to setup?

### Slack

- Create a Slack App from the slack organization you want it to be
- Make sure you config those tabs correctly:
  - Interactivity & Shortcuts
    - **Enabled**: `true`
    - **Request URL**: `http://yourDomain.io/api/action`
  - Slash Commands
    - **Command**: `/shifubriq`
    - **Request URL**: `http://yourDomain.io/api/shifubriq`
    - **Short Description**: `Start a game of shifubriq — You might win (or lose) 1 briq!`
    - **Usage Hint**: `@username`
    - **Escape channels, users, and links sent to your app**: `true`
  - OAuth & Permissions (Bot Token Scopes section)
    - `channels:manage`
    - `chat:write`
    - `commands`
    - `im:write`
    - `team:read`
    - `users:read`
- From the Basic Information tab, copy your **Verification Token** to the config file (`src/config.ts`) under `slack.verificationToken`
- From the OAuth & Permissions tab, copy your **Bot User OAuth Access Token** to the config file (`src/config.ts`) under `slack.token`
- Deploy your app to your Organization

### Briq

- Go to [your briq legacy admin interface](https://api.givebriq.com/legacy/admin/apps)
- Create a custom Briq integration
- Copy your **API access token** to the config file (`src/config.ts`) under `briq.token`


## How to dev?

`yarn test` to run test
`tsx` to build
`yarn start` to start the project
`yarn dev` to start the project with a watcher


## License
This project is provided under Beerware license (see [LICENSE.md](LICENSE.md))

##### Note
Inspired from [nmalzieu/shifubriq](https://github.com/nmalzieu/shifubriq)
