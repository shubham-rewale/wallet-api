/* eslint-disable import/extensions */
import express from "express";

import * as authController from "../controllers/authControllers.js";
import * as transactionControllers from "../controllers/transactionControllers.js";

const transactionRouter = express.Router();

transactionRouter
	.route("/transfer")
	.post(authController.isUserLoggedIn, transactionControllers.transferFunds);

transactionRouter.route("/getTransactionDetails").get(transactionControllers.getTransactionDetails);

transactionRouter
	.route("/getAllTransactions")
	.get(authController.isUserLoggedIn, transactionControllers.getAllTransactions);

export default transactionRouter;
