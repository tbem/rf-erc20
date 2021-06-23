require('@nomiclabs/hardhat-waffle');
const LPS = require('./test/PLPS.json');

const RPC_URL = 'http://localhost:8545';
const PRIVATE_KEY = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';

const assert = (condition, message) => {
  if (condition) return;
  throw new Error(message);
}

task('deploy', 'Deploy RealFevr Token')
  .addParam('distributionContract', 'distributionContract address')
  .setAction(async ({distributionContract}) => {
    assert(ethers.utils.isAddress(distributionContract), `distributionContract address '${distributionContract}' is invalid.`);
    const [deployer] = await ethers.getSigners();

    console.log(
      `Deploying RealFevr Token with the account: ${deployer.address}`
    );

    console.log(`Deployer balance: ${ethers.utils.formatEther(await deployer.getBalance())} ETH`);

    const Token = await ethers.getContractFactory('RealFevrToken');
    const token = await Token.deploy(distributionContract);

    console.log('Token address:', token.address);

    console.log('Mining...');
    await token.deployed();
    console.log(`Deployer balance: ${ethers.utils.formatEther(await deployer.getBalance())} ETH`);
  });

task('revoke-blocked', 'Revoke tokens from blocked accounts')
  .addParam('token', 'Address of the protected token contract')
  .addParam('to', 'Address to transfer revoked tokens to')
  .addParam('json', 'Path to the blocked accounts json. Example: ["0x1234", "0x5678", ...]')
  .setAction(async ({token: tokenAddress, json, to}) => {
    assert(ethers.utils.isAddress(tokenAddress), `Token address '${tokenAddress}' is invalid.`);
    assert(ethers.utils.isAddress(to), `Revoke to address '${to}' is invalid.`);
    const blocked = require(json);
    for (let account of blocked) {
      assert(ethers.utils.isAddress(account), `Blocked address '${account}' is invalid.`);
    }
    const [sender] = await ethers.getSigners();

    const Token = await ethers.getContractFactory('ExampleTokenWithProtection');
    const token = await Token.attach(tokenAddress, Token.interface);

    console.log(
      `Revoking tokens from blocked accounts to ${to}. Transaction sender: ${sender.address}`
    );

    console.log(`To balance: ${ethers.utils.formatEther(await token.balanceOf(to))}`);
    console.log(`Sender balance: ${ethers.utils.formatEther(await sender.getBalance())} ETH`);

    let tx;
    const batchSize = 50n;
    for (let i = 0n; i <= (BigInt(blocked.length) / batchSize); i++) {
      let entries = blocked.slice(parseInt(i * batchSize), parseInt((i + 1n) * batchSize));
      tx = await token.connect(sender).revokeBlocked(entries, to);
      console.log(`Batch ${i + 1n}: ${tx.hash}`);
    }
    console.log('Mining...');
    await (tx && tx.wait());

    console.log(`To balance: ${ethers.utils.formatEther(await token.balanceOf(to))}`);
    console.log(`Sender balance: ${ethers.utils.formatEther(await sender.getBalance())} ETH`);
  });

task('unblock', 'Unblock accidentally blocked accounts')
  .addParam('token', 'Address of the protected token contract')
  .addParam('json', 'Path to the blocked accounts json. Example: ["0x1234", "0x5678", ...]')
  .setAction(async ({token: tokenAddress, json}) => {
    assert(ethers.utils.isAddress(tokenAddress), `Token address '${tokenAddress}' is invalid.`);
    const blocked = require(json);
    for (let account of blocked) {
      assert(ethers.utils.isAddress(account), `Blocked address '${account}' is invalid.`);
    }
    const [sender] = await ethers.getSigners();

    const Token = await ethers.getContractFactory('ExampleTokenWithProtection');
    const token = await Token.attach(tokenAddress, Token.interface);

    console.log(
      `Unblocking blocked accounts. Transaction sender: ${sender.address}`
    );

    console.log(`Sender balance: ${ethers.utils.formatEther(await sender.getBalance())} ETH`);

    let tx;
    const batchSize = 50n;
    for (let i = 0n; i <= (BigInt(blocked.length) / batchSize); i++) {
      let entries = blocked.slice(parseInt(i * batchSize), parseInt((i + 1n) * batchSize));
      tx = await token.connect(sender).LiquidityProtection_unblock(entries);
      console.log(`Batch ${i + 1n}: ${tx.hash}`);
    }
    console.log('Mining...');
    await (tx && tx.wait());

    console.log(`Sender balance: ${ethers.utils.formatEther(await sender.getBalance())} ETH`);
  });

task('disableProtection', 'Manually disable liquidity protection')
  .addParam('token', 'Address of the protected token contract')
  .setAction(async ({token: tokenAddress}) => {
    assert(ethers.utils.isAddress(tokenAddress), `Token address '${tokenAddress}' is invalid.`);
    const [sender] = await ethers.getSigners();

    const Token = await ethers.getContractFactory('ExampleTokenWithProtection');
    const token = await Token.attach(tokenAddress, Token.interface);

    console.log(
      `Disabling liquidity protection with account: ${sender.address}`
    );

    console.log(`Sender balance: ${ethers.utils.formatEther(await sender.getBalance())} ETH`);

    const tx = await token.connect(sender).disableProtection();
    console.log(`${tx.hash}`);
    console.log('Mining...');
    await tx.wait();

    console.log(`Sender balance: ${ethers.utils.formatEther(await sender.getBalance())} ETH`);
  });

module.exports = {
  networks: {
    target: {
      url: RPC_URL,
      accounts: [PRIVATE_KEY],
    },
    fork: {
      url: 'http://localhost:8545',
    },
  },
  solidity: {
    version: '0.6.12',
    settings: {
      optimizer: {
        enabled: true,
        runs: 999999,
      },
    },
  },
};
