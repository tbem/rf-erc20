# RealFevr Token With Liquidity Protection Service

## Installation

    npm install
    npm run compile

## Testing on fork

    To run the tests please execute the next commands in two separate terminals

    npm run fork
    npm run test -- --network fork

## Deployment

    BSC mainnet node url: https://bsc-dataseed1.binance.org
    Set target network node url and deployer private key in the hardhat.config.js.

    npm run hardhat -- --network target deploy --distribution-contract 0x2546bcd3c84621e976d8185a91a922ae77ecec30


## Usage

Unblock accounts (must be done while protection is still on):

    npm run hardhat -- --network target unblock --token 0xTokenAddress --json ./blocked.example.json

Revoke tokens from blocked accounts (must be done while protection is still on):

    npm run hardhat -- --network target revoke-blocked --token 0xTokenAddress --to 0xRevokeToAddress --json ./blocked.example.json

Disable protection to make transfers cheaper:

    npm run hardhat -- --network target disableProtection --token 0xTokenAddress
