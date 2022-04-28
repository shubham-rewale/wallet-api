/* eslint-disable import/extensions */
import mongoose from "mongoose";

import userModel from "../models/userModel.js";
import trxModel from "../models/transactionModel.js";
import Email from "../services/email.js";

// eslint-disable-next-line consistent-return
export const transferFunds = async (req, res) => {
	const session = await mongoose.startSession();
	session.startTransaction();
	try {
		const { recepientEmail, amountToTransfer } = req.body;
		const recepientUser = await userModel.findOne({ email: recepientEmail }, null, { session });
		const senderUser = await userModel.findById(req.user.id, null, { session });
		if (!recepientUser) {
			return res.status(404).json({
				status: "Fail",
				message: "Recepient address doesn't exist",
			});
		}
		if (senderUser.balance < amountToTransfer) {
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
				},
			],
			{ session }
		);
		senderUser.updateBalance(-amountToTransfer);
		recepientUser.updateBalance(amountToTransfer);
		await senderUser.save({ validateBeforeSave: false });
		await recepientUser.save({ validateBeforeSave: false });
		await session.commitTransaction();
		const mailToSender = new Email(senderUser);
		await mailToSender.sendTransactionConfirmation(trx[0]);
		const mailToReceiver = new Email(recepientUser);
		await mailToReceiver.sendTransactionConfirmation(trx[0]);
		res.status(200).json({
			status: "Success",
			message: "Transfer was successful",
			transactionId: trx.id,
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
