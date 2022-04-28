import nodemailer from "nodemailer";

class Email {
	constructor(user) {
		this.to = user.email;
		this.from = process.env.FROM_EMAIL;
	}

	// eslint-disable-next-line class-methods-use-this
	transporter() {
		return nodemailer.createTransport({
			host: process.env.MAIL_HOST,
			port: process.env.MAIL_SERVER_PORT,
			auth: {
				user: process.env.MAIL_USERNAME,
				pass: process.env.MAIL_PASSWORD,
			},
		});
	}

	async sendWelcome() {
		const mailOptions = {
			from: this.from,
			to: this.to,
			subject: "Welcome to the Payment system",
			text: "This mail is to notify that you have successfully joined the platform. As a welcome gift your wallet is credited with $1000",
		};
		await this.transporter().sendMail(mailOptions);
	}

	async sendPasswordResetToken(resetToken) {
		const mailOptions = {
			from: this.from,
			to: this.to,
			subject: "Password Reset Token",
			text: `This is the password reset token - ${resetToken}`,
		};

		await this.transporter().sendMail(mailOptions);
	}

	async sendTransactionConfirmation(trx) {
		const mailOptions = {
			from: this.from,
			to: this.to,
			subject: "Transaction Confirmation",
			text: `Transaction was successful, From: ${trx.sender} => To: ${trx.receiver}, of Amount: ${trx.amount}, with transaction id of ${trx.id}`,
		};

		await this.transporter().sendMail(mailOptions);
	}
}

export default Email;
