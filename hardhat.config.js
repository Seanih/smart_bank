require('@nomicfoundation/hardhat-toolbox');
require('dotenv').config({ path: __dirname + '/.env' });

/** @type import('hardhat/config').HardhatUserConfig */
const ALCHEMY_KEY = 'ALCHEMY_KEY';
const GOERLI_PK = 'GOERLI_PK';

module.exports = {
	solidity: '0.8.17',
	networks: {
		goerli: {
			url: `https://eth-goerli.g.alchemy.com/v2/${ALCHEMY_KEY}`,
			accounts: [GOERLI_PK],
		},
	},
};
