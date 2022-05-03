import Jwt from "jsonwebtoken";

const sendJWToken = (user, statusCode, req, res) => {
	// eslint-disable-next-line no-underscore-dangle
	const payload = user._id;
	const token = Jwt.sign({ payload }, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_EXPIRES_IN,
	});
	res.cookie("jwt", token, {
		expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
		httpOnly: true,
		secure: req.secure || req.headers["x-forwarded-proto"] === "https",
	});
	// eslint-disable-next-line no-param-reassign
	user.password = undefined;
	res.status(statusCode).json({
		status: "Success",
		token,
		data: {
			user,
		},
	});
};

export default sendJWToken;
