# UnifyProtocol

Basic hardhat backend with react frontend template. 
## Quick start

The first things you need to do is cloning this repository and installing its
dependencies:

```sh
git clone https://github.com/jrocco2/UnifyProtocol.git
cd UnifyProtocol/hardhat
npm install
```

Once installed, let's run Hardhat's testing network:

```sh
npx hardhat node
```

Then open a new terminal and in UnifyProtocol/hardhat run this to
deploy your contract:

```sh
npx hardhat run scripts/deploy.js --network localhost
```
All contracts are injected into the frontend when deployed.

Finally, we can run the frontend. Go back to the root directory (UnifyProtocol) then:

```sh
cd react/unify
npm install
npm start
```

Change metamask to localhost to interact with the app.
