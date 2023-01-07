# Smart Bank DApp

This project demonstrates how a bank would work as a decentralized application (with the exception of 'lending' or 'interest' features).

---

### Technology Stack / Tools

---

- Solidity (smart contract creation)
- Hardhat (development environment & unit testing)
- Next.js / Javascript (building & managing the UI)
- Tailwind CSS (styling the UI)
- Ethers.js (connecting UI to blockchain for interactions)
- MongoDB (storing all wallet addresses that have accessed the DApp)
- Mongoose (object data modeling)
- Git (version control)

---

### Requirements For Initial Setup

---

- Install code editor of choice
- Install [Node.js](https://nodejs.org/en/)

---

### Set Up Project

---

#### 1. Clone/download the repository

#### 2. Open project, navigate to root folder & install dependencies via terminal

`$ npm i`

#### 3. Create `.env.local` file in your project's root folder

#### 4. Set up environment variables in `.env.local` file; you will need to address the following:

- MONGODB_URI = [your mongo connection string](https://www.mongodb.com/)
- GOERLI_DEV_PK = [your etherscan api key](https://etherscan.io/)
- ALCHEMY_API_KEY = [your alchemy api key](https://www.alchemy.com/)
- MORALIS_API_KEY = [your moralis api key](https://moralis.io/)
- NEXTAUTH_URL = your local server, i.e. http://localhost:3000
- NEXTAUTH_SECRET = whatEverYoU-want_it/2..b<br>

  (⬇️ for coinbase wallet ⬇️)

- NODE_ENDPOINT = https://goerli.ethereum.coinbasecloud.net <br>(this is your [Goerli testnet endpoint](https://docs.cloud.coinbase.com/node/docs/node-features))
- NODE_USERNAME = [your username](https://docs.cloud.coinbase.com/node/docs/ethersjs)
- NODE_PASSWORD = [your password](https://docs.cloud.coinbase.com/node/docs/ethersjs)

#### 5. Run tests

`$ npx hh test` in root folder

---

### Host project locally

---

If you want to deploy the project on your local hardhat node:

#### 1. Start hardhat node

`$ npx hh node` in root folder

#### 2. Hydrate DApp with transaction data (OPTIONAL)

- un-comment the code before the GOERLI Deployment Script in `scripts/deploy.js`

#### 3. Deploy the contract

`$ npx hh run --network localhost scripts/deploy.js` in root folder
