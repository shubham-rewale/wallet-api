import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
	trxTimeStamp: {
		type: Date,
		default: Date.now(),
	},
	sender: {
		type: mongoose.Schema.ObjectId,
		ref: "userModel",
		require: [true, "Sender must be specified"],
	},
	receiver: {
		type: mongoose.Schema.ObjectId,
		ref: "userModel",
		require: [true, "Receiver must be specified"],
	},
	amount: {
		type: Number,
		require: [true, "Amount must be specified"],
	},
});

// eslint-disable-next-line func-names
transactionSchema.pre(/^find/, function (next) {
	this.populate({ path: "sender", select: "email" }).populate({
		path: "receiver",
		select: "email",
	});
	next();
});

const trxModel = mongoose.model("trxModel", transactionSchema);

export default trxModel;
