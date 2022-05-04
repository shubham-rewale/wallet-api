# Wallet API
## Simple Wallet Implementation in NodeJs Environment 

The API is developed using Express framework and MongoDB as a database, with NodeJs environment.
- User can SignUp to the system to use the API.
- User can transfer the funds to the other users of the system.

***

### Features

- User session is maintained using JWT.
- Confirmation is send via Email on User signUp.
- User account is password protected.
- Transaction Confirmation is send via Email to the User

***

### Tech

- Node.js
- Express
- Nodemailer
- Mongoose
- MongoDB

***

### Run the API
API requires Node.js to run.
Instead of Standalone MongoDB server, it works with MongoDB replica-set to support multidocument db operations (transactions).
Clone the Repo and Install the dependencies and devDependencies and start the server.

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
- (POST) --- api/v1/transactions/transfer
- (GET) --- api/v1/transactions/getTransactionDetails
- (GET) --- api/v1/transactions/getAllTransactions