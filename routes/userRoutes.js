/* eslint-disable import/extensions */
import express from "express";

import * as authController from "../controllers/authControllers.js";
import * as userController from "../controllers/userControllers.js";

const userRouter = express.Router();

userRouter.route("/signUp").post(authController.signUp);

userRouter.route("/login").post(authController.login);

userRouter.route("/logout").get(authController.logout);

userRouter.route("/forgotPassword").post(authController.forgotPassword);

userRouter.route("/resetPassword").patch(authController.resetPassword);

userRouter
	.route("/updatePassword")
	.patch(authController.isUserLoggedIn, authController.updatePassword);

userRouter
	.route("/updatePaymentAddress")
	.patch(authController.isUserLoggedIn, userController.updatePaymentAddress);

userRouter.route("/getBalance").get(userController.getBalance);

userRouter.route("/getUser").get(userController.getUser);

export default userRouter;
