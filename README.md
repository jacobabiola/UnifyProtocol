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

To deploy contracts to the ETH network write in deploy.js
To deploy contracts to the POLYGON network write in deployPolygon.js

Then open a new terminal and in UnifyProtocol/hardhat and run this to
deploy your contracts to the forked networks:

```sh
npm run deploy
```

or deploy each netwotk contracts seperately with
```sh
npm run deployEth
npm run deployPolygon
```

To inject artifacts into the frontend make sure to add "saveFrontendFiles()" in deploy.js when deployed.

Finally, we can run the frontend. Go back to the root directory (UnifyProtocol) then:

```sh
cd react/unify
npm install
npm start
```

Change metamask to Goerli/Mumbai to interact with the app.
