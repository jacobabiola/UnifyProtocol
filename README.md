# UnifyProtocol

Basic hardhat backend with react frontend template. 
## Quick start

The first things you need to do is clone this repository and install its
dependencies:

```sh
git clone https://github.com/jrocco2/UnifyProtocol.git
cd UnifyProtocol/hardhat
npm install
```

Once installed, we can fork Polygon and Eth Mainnet and deploy them to nodes. In seperate terminals run:

```sh
npm run forkEth
npm run forkPolygon
```

To deploy contracts to the ETH network write in deploy.js
To deploy contracts to the POLYGON network write in deployPolygon.js

Then open a new terminal and in UnifyProtocol/hardhat and run this to
deploy your contracts to the forked networks:

```sh
npm run deploy
```

To inject artifacts into the frontend make sure to add "saveFrontendFiles()" in deploy.js when deployed.

Finally, we can run the frontend. Go back to the root directory (UnifyProtocol) then:

```sh
cd react/unify
npm install
npm start
```

Change metamask to localhost to interact with the app.
