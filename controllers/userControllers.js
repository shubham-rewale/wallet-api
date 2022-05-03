/* eslint-disable import/extensions */
import { ethers } from "ethers";

import tokenContractABI from "../services/tokenContractABI.js";
import userModel from "../models/userModel.js";

export const getBalance = async (req, res) => {
	try {
		const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545/");
		const tokenContractInstance = new ethers.Contract(
			process.env.TOKEN_CONTRACT_ADDRESS,
			tokenContractABI,
			provider
		);
		const { userEmail } = req.body;
		const User = await userModel.findOne({ email: userEmail });
		let balance = await tokenContractInstance.balanceOf(User.paymentAddress);
		balance = ethers.utils.formatUnits(balance, 18);
		res.status(200).json({
			status: "Success",
			balance,
		});
	} catch (err) {
		console.log(err);
		res.status(500).json({
			status: "Fail",
			err,
		});
	}
};

export const updatePaymentAddress = async (req, res) => {
	try {
		await userModel.updateOne(
			{ email: req.user.email },
			{ paymentAddress: req.body.newPaymentAddress },
			{ runValidators: true }
		);
		res.status(200).json({
			status: "Success",
			message: "Payment Address has been updated",
		});
	} catch (err) {
		console.log(err);
		res.status(500).json({
			status: "Fail",
			err,
		});
	}
};

// eslint-disable-next-line consistent-return
export const getUser = async (req, res) => {
	try {
		const User = await userModel.findOne({ email: req.body.email });
		if (!User) {
			return res.status(404).json({
				status: "Fail",
				message: "User does not exist",
			});
		}
		res.status(200).json({
			status: "Success",
			User,
		});
	} catch (err) {
		console.log(err);
		res.status(500).json({
			status: "Fail",
			err,
		});
	}
};
