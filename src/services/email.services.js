const transporter = require("../config/email");

const sendPasswordResetEmail = async (email, resetToken) => {
    console.log(email);
  const resetUrl = new URL(
    "/reset-password",
    process.env.FRONTEND_URL
  );

  resetUrl.searchParams.set("token", resetToken);

  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "Reset your password",
    text: [
      "We received a request to reset your password.",
      `Reset your password using this link: ${resetUrl.toString()}`,
      "This link expires in 15 minutes.",
      "If you did not request this, you can ignore this email."
    ].join("\n\n"),
    html: `
      <h2>Reset your password</h2>
      <p>We received a request to reset your password.</p>
      <p>
        <a href="${resetUrl.toString()}">Reset your password</a>
      </p>
      <p>This link expires in 15 minutes.</p>
      <p>If you did not request this, you can ignore this email.</p>
    `
  });

  return info;
};

module.exports = { sendPasswordResetEmail };