require('@nomicfoundation/hardhat-toolbox');
require('dotenv').config({ path: __dirname + '/.env' });

/** @type import('hardhat/config').HardhatUserConfig */
const ALCHEMY_API_KEY = 'ALCHEMY_API_KEY';
const GOERLI_DEV_PK = 'GOERLI_PK';

module.exports = {
	solidity: '0.8.17',
	networks: {
		goerli: {
			url: `https://eth-goerli.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
			accounts: [GOERLI_DEV_PK],
		},
	},
};
