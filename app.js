/* eslint-disable import/extensions */
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import ExpressMongoSanitize from "express-mongo-sanitize";
import hpp from "hpp";
import cookieParser from "cookie-parser";
import compression from "compression";
import cors from "cors";

import userRouter from "./routes/userRoutes.js";
import transactionRouter from "./routes/transactionRoutes.js";

const app = express();

app.use(cors());

app.options("*", cors());

app.use(helmet());

const limiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 100,
	standardHeaders: true,
	legacyHeaders: false,
});
app.use(limiter);

app.use(express.json({ limit: "10kb" }));

app.use(express.urlencoded({ extended: true, limit: "10kb" }));

app.use(cookieParser());

app.use(ExpressMongoSanitize());

app.use(hpp({ whitelist: [] }));

app.use(compression());

app.use("/api/v1/users", userRouter);
app.use("/api/v1/transactions", transactionRouter);

app.all("*", (req, res) => {
	res.status(400).json({
		status: "Fail",
		message: "did not find any matching route",
	});
});

// eslint-disable-next-line import/prefer-default-export
export { app };
