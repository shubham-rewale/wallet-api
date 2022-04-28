/* eslint-disable import/extensions */
import mongoose from "mongoose";
import dotenv from "dotenv";

import { app } from "./app.js";

process.on("uncaughtException", (err) => {
	console.log("UNCAUGHT EXCEPTION! Shutting down...");
	console.log(err.name, err.message);
	// eslint-disable-next-line no-process-exit
	process.exit(1);
});

dotenv.config();

mongoose
	.connect(process.env.LEDGER_DATABASE)
	// eslint-disable-next-line no-unused-vars
	.then((con) => {
		console.log("DB connection successful!");
	})
	.catch((err) => {
		console.log(`DB connection error ${err}`);
	});

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
	console.log(`Server is running on port ${port}...`);
});

process.on("unhandledRejection", (err) => {
	console.log("UNHANDLED REJECTION! Shutting down...");
	console.log(err.name, err.message);
	server.close(() => {
		// eslint-disable-next-line no-process-exit
		process.exit(1);
	});
});
