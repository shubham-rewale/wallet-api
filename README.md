# Wallet API
## Simple Wallet Implementation in NodeJs Environment 

The API is developed using Express framework, MongoDB and Ethereum with NodeJs environment.
- User can SignUp to the system to use the API.
- User can transfer the funds in the form of ERC20 tokens to the other users of the system.

***

### Features

- User session is maintained using JWT.
- Confirmation is send via Email on User signUp.
- User account is password protected.
- Transaction Confirmation is send via Email to the User
- Transaction is acheived using ERC20 contracts deployed on chain

***

### Tech

- Node.js
- Express
- Nodemailer
- Mongoose
- MongoDB
- Hardhat
- Solidity

***

### Run the API
API requires installed Node.js to run.
Instead of Standalone MongoDB server, it works with MongoDB replica-set to support multidocument db operations (transactions).
Clone the Repo and Install the dependencies and devDependencies. Deploy the token contract using Hardhat environment and get the address of the deployed contract and add it to the environment variable. Start the server.

```sh
npm i
npm start
```
This API is not ready for the use in production.

***

### Available Endpoints
- (POST) ---  api/v1/users/signUp
- (POST) --- api/v1/users/login
- (GET) --- api/v1/users/logout
- (POST) --- api/v1/users/forgotPassword
- (PATCH) --- api/v1/users/resetPassword
- (PATCH) --- api/v1/users/updatePassword
- (GET) --- api/v1/users/getBalance
- (GET) --- api/v1/users/getUser
- (PATCH) --- api/v1/users/updatePaymentAddress
- (POST) --- api/v1/transactions/transfer
- (GET) --- api/v1/transactions/getTransactionDetails
- (GET) --- api/v1/transactions/getAllTransactions