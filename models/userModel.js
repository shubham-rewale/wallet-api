/* eslint-disable func-names */
import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const userSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, "Name can not be null"],
	},
	email: {
		type: String,
		required: [true, "Email can not ne null"],
		unique: true,
		lowercase: true,
		validate: [validator.isEmail, "Please provide a valid email"],
	},
	role: {
		type: String,
		enum: ["admin", "user"],
		default: "user",
	},
	paymentAddress: {
		type: String,
		required: [true, "Payment address can not ne null"],
		validate: [validator.isEthereumAddress, "Please provide a valid payment address"],
	},
	password: {
		type: String,
		required: [true, "Password can not be null"],
		minlength: 8,
		select: false,
	},
	passwordConfirm: {
		type: String,
		required: [true, "Please confirm your password"],
		validate: {
			// eslint-disable-next-line object-shorthand
			validator: function (el) {
				return el === this.password;
			},
			message: "Password did not match",
		},
	},
	passwordChangedAt: Date,
	passwordResetToken: String,
	passwordResetExpires: Date,
	active: {
		type: Boolean,
		default: true,
		select: false,
	},
});

// eslint-disable-next-line consistent-return
userSchema.pre("save", async function (next) {
	if (!this.isModified("password")) {
		return next();
	}
	this.password = await bcrypt.hash(this.password, 12);
	this.passwordConfirm = undefined;
	next();
});

// eslint-disable-next-line consistent-return
userSchema.pre("save", function (next) {
	if (!this.isModified("password") || this.isNew) {
		return next();
	}
	this.passwordChangedAt = Date.now() - 1000;
	next();
});

userSchema.pre(/^find/, function (next) {
	this.find({ active: { $ne: false } });
	next();
});

userSchema.methods.checkPassword = async function (inputPassword, storedPassword) {
	// eslint-disable-next-line no-return-await
	return await bcrypt.compare(inputPassword, storedPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
	if (this.passwordChangedAt) {
		const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
		return JWTTimestamp < changedTimestamp;
	}
	// False means NOT changed
	return false;
};

userSchema.methods.createPasswordResetToken = function () {
	const resetToken = crypto.randomBytes(32).toString("hex");
	this.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");
	this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
	return resetToken;
};

const userModel = mongoose.model("userModel", userSchema);

export default userModel;
