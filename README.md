# 🏓 ping pong ponyhof

At point this will be a tabletennis software for organizing tournaments. Based on the rules of the bavarian TT Race Tournament. See [here](https://www.bttv.de/) for more information.

## Getting Started

### Starting Development
Install all dependencies with `yarn` and start the electron app with `yarn start-dev`. This will start the electron app, serve the client app on `localhost:8000` and offers access to the backend on `localhost:4000` (which currently redirects to the client).

### Starting Production
Start the app in the `production` environment. This executes the build process of the application and the client. After that electron will start.

Open the environment settings `.env` in the root folder and set the variable `ELECTRON_IS_DEV` to `0` (0 = production, 1 = development)

```
$ yarn start
```
