/* eslint-disable import/extensions */
import Jwt from "jsonwebtoken";
import crypto from "crypto";
import { promisify } from "util";

import userModel from "../models/userModel.js";
import Email from "../services/email.js";
import sendJWToken from "../services/sendJWToken.js";

export const signUp = async (req, res) => {
	try {
		const newUser = await userModel.create({
			name: req.body.name,
			email: req.body.email,
			password: req.body.password,
			passwordConfirm: req.body.passwordConfirm,
		});
		const mail = new Email(newUser);
		await mail.sendWelcome();
		sendJWToken(newUser, 201, req, res);
	} catch (err) {
		console.log(err);
		res.status(400).json({
			status: "Fail",
			err,
		});
	}
};

// eslint-disable-next-line consistent-return
export const login = async (req, res) => {
	try {
		const { email, password } = req.body;
		if (!email || !password) {
			return res.status(400).json({
				status: "fail",
				message: "Email or Password not found",
			});
		}
		const User = await userModel.findOne({ email }).select("+password");
		if (!User || !(await User.checkPassword(password, User.password))) {
			return res.status(400).json({
				status: "Fail",
				message: "Email or Password is incorrect",
			});
		}
		sendJWToken(User, 200, req, res);
	} catch (err) {
		console.log(err);
		res.status(400).json({
			status: "Fail",
			err,
		});
	}
};

export const logout = (req, res) => {
	console.log(req.body);

	try {
		res.cookie("jwt", "loggedout", {
			expires: new Date(Date.now() + 10 * 1000),
			httpOnly: true,
		});
		res.status(200).json({ status: "success" });
	} catch (err) {
		console.log(err);
		res.status(400).json({
			status: "Fail",
			err,
		});
	}
};

// eslint-disable-next-line consistent-return
export const isUserLoggedIn = async (req, res, next) => {
	if (req.cookies.jwt) {
		try {
			const decoded = await promisify(Jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);
			const currentUser = await userModel.findById(decoded.payload);
			if (!currentUser) {
				return res.status(401).json({
					status: "Fail",
					message: "You are not logged in",
				});
			}
			if (currentUser.changedPasswordAfter(decoded.iat)) {
				return res.status(401).json({
					status: "Fail",
					message: "Should log in with new password",
				});
			}
			req.user = currentUser;
			return next();
		} catch (err) {
			console.log(err);
			res.status(400).json({
				status: "Fail",
				message: err,
			});
		}
	}
	res.status(401).json({
		status: "Fail",
		message: "You are not logged in",
	});
};

// eslint-disable-next-line consistent-return
export const forgotPassword = async (req, res) => {
	try {
		const User = await userModel.findOne({ email: req.body.email });
		if (!User) {
			return res.status(404).json({
				status: "Fail",
				message: "User does not exist",
			});
		}
		const resetToken = User.createPasswordResetToken();
		await User.save({ validateBeforeSave: false });
		const mail = new Email(User);
		await mail.sendPasswordResetToken(resetToken);
		res.status(200).json({
			status: "success",
			message: "Token sent to email!",
		});
	} catch (err) {
		console.log(err);
		res.status(400).json({
			status: "Fail",
			err,
		});
	}
};

// eslint-disable-next-line consistent-return
export const resetPassword = async (req, res) => {
	try {
		const hashedToken = crypto.createHash("sha256").update(req.body.resetToken).digest("hex");
		const User = await userModel.findOne({
			passwordResetToken: hashedToken,
			passwordResetExpires: { $gt: Date.now() },
		});
		if (!User) {
			return res.status(404).json({
				status: "Fail",
				message: "User does not exist or Reset time expired",
			});
		}
		User.password = req.body.password;
		User.passwordConfirm = req.body.passwordConfirm;
		User.passwordResetToken = undefined;
		User.passwordResetExpires = undefined;
		await User.save();
		sendJWToken(User, 200, req, res);
	} catch (err) {
		console.log(err);
		res.status(400).json({
			status: "Fail",
			err,
		});
	}
};

// eslint-disable-next-line consistent-return
export const updatePassword = async (req, res) => {
	try {
		const User = await userModel.findById(req.user.id).select("+password");
		if (!(await User.checkPassword(req.body.currentPassword, User.password))) {
			return res.status(401).json({
				status: "Fail",
				message: "Current password is incorrect",
			});
		}
		User.password = req.body.password;
		User.passwordConfirm = req.body.passwordConfirm;
		await User.save();
		sendJWToken(User, 200, req, res);
	} catch (err) {
		console.log(err);
		res.status(400).json({
			status: "Fail",
			err,
		});
	}
};
