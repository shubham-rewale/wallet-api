/* eslint-disable import/extensions */
import mongoose from "mongoose";
import { ethers } from "ethers";

import userModel from "../models/userModel.js";
import trxModel from "../models/transactionModel.js";
import Email from "../services/email.js";
import tokenContractABI from "../services/tokenContractABI.js";

// eslint-disable-next-line consistent-return
export const transferFunds = async (req, res) => {
	const session = await mongoose.startSession();
	session.startTransaction();
	try {
		const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545/");
		const signer = new ethers.Wallet(req.body.senderPrivateKey, provider);
		const tokenContractInstance = new ethers.Contract(
			process.env.TOKEN_CONTRACT_ADDRESS,
			tokenContractABI,
			provider
		);
		const { recepientEmail, amountToTransfer } = req.body;
		const transaferAmount = ethers.utils.parseUnits(amountToTransfer, 18);
		const recepientUser = await userModel.findOne({ email: recepientEmail }, null, { session });
		const senderUser = await userModel.findById(req.user.id, null, { session });
		if (!recepientUser) {
			return res.status(404).json({
				status: "Fail",
				message: "Recepient address doesn't exist",
			});
		}
		if (transaferAmount.gt(await tokenContractInstance.balanceOf(signer.address))) {
			return res.status(401).json({
				status: "Fail",
				message: "Sender doesn't have enough balance",
			});
		}
		const trx = await trxModel.create(
			[
				{
					sender: senderUser.id,
					receiver: recepientUser.id,
					amount: amountToTransfer,
					ethTRXHash: "Null",
				},
			],
			{ session }
		);
		const ethTrx = await tokenContractInstance
			.connect(signer)
			.transfer(recepientUser.paymentAddress, transaferAmount);
		if (!ethTrx) {
			throw new Error("Transaction Failed");
		}
		await trxModel.findByIdAndUpdate(trx[0].id, { ethTRXHash: ethTrx.hash }, { session });
		await session.commitTransaction();
		const mailToSender = new Email(senderUser);
		await mailToSender.sendTransactionConfirmation(
			trx[0],
			signer.address,
			recepientUser.paymentAddress
		);
		const mailToReceiver = new Email(recepientUser);
		await mailToReceiver.sendTransactionConfirmation(
			trx[0],
			signer.address,
			recepientUser.paymentAddress
		);
		res.status(200).json({
			status: "Success",
			message: "Transfer was successful",
			transactionId: trx[0].id,
			ethTransactionHash: ethTrx.hash,
		});
	} catch (err) {
		console.log(err);
		await session.abortTransaction();
		res.status(400).json({
			status: "Fail",
			message: "Transaction failed",
			err,
		});
	} finally {
		session.endSession();
	}
};

// eslint-disable-next-line consistent-return
export const getTransactionDetails = async (req, res) => {
	const trx = await trxModel.findById(req.body.transactionId);
	if (!trx) {
		return res.status(404).json({
			status: "Fail",
			message: "Transaction is not found",
		});
	}
	res.status(200).json({
		status: "Success",
		transaction: trx,
	});
};

export const getAllTransactions = async (req, res) => {
	if (req.user.role === "admin") {
		const allTrx = await trxModel.find({});
		return res.status(200).json({
			status: "Success",
			message: "List of all the transactions",
			transactionCount: allTrx.length,
			allTrx,
		});
	}
	if (req.user.role === "user") {
		const allTrx = await trxModel.find({
			$or: [{ sender: req.user.id }, { receiver: req.user.id }],
		});
		return res.status(200).json({
			status: "Success",
			message: "List of all the transactions pertaining to user",
			transactionCount: allTrx.length,
			allTrx,
		});
	}
	return res.status(404).json({
		status: "Fail",
		message: "No transactions found",
	});
};
