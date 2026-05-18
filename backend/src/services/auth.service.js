const argon2 = require("argon2");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { sendMail } = require("./mail.service");

function toSafeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

function signToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      name: user.name,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );
}

function getResetTokenTtlMinutes() {
  const ttl = Number(process.env.RESET_PASSWORD_TOKEN_TTL_MINUTES || 30);
  return Number.isFinite(ttl) && ttl > 0 ? ttl : 30;
}

function hashResetToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

async function register(dataSource, payload) {
  const userRepository = dataSource.getRepository("User");
  const normalizedEmail = payload.email.toLowerCase();
  const existing = await userRepository.findOne({
    where: { email: normalizedEmail },
  });

  if (existing) {
    const error = new Error("Email already exists");
    error.statusCode = 409;
    throw error;
  }

  const passwordHash = await argon2.hash(payload.password);
  const user = userRepository.create({
    name: payload.name,
    email: normalizedEmail,
    passwordHash,
  });

  await userRepository.save(user);
  const token = signToken(user);

  return {
    token,
    user: toSafeUser(user),
  };
}

async function login(dataSource, payload) {
  const userRepository = dataSource.getRepository("User");
  const user = await userRepository.findOne({
    where: { email: payload.email.toLowerCase() },
  });

  if (!user) {
    const error = new Error("Invalid credentials");
    error.statusCode = 401;
    throw error;
  }

  const isValid = await argon2.verify(user.passwordHash, payload.password);

  if (!isValid) {
    const error = new Error("Invalid credentials");
    error.statusCode = 401;
    throw error;
  }

  return {
    token: signToken(user),
    user: toSafeUser(user),
  };
}

async function getCurrentUser(dataSource, userId) {
  const userRepository = dataSource.getRepository("User");
  const user = await userRepository.findOne({ where: { id: userId } });

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  return toSafeUser(user);
}

async function forgotPassword(dataSource, payload) {
  const userRepository = dataSource.getRepository("User");
  const email = String(payload.email || "").toLowerCase();
  const user = await userRepository.findOne({ where: { email } });

  if (!user) {
    return {
      message:
        "If an account exists for this email, a password reset link has been generated.",
    };
  }

  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashResetToken(rawToken);
  const expiresAt = new Date(
    Date.now() + getResetTokenTtlMinutes() * 60 * 1000,
  );

  user.resetPasswordTokenHash = tokenHash;
  user.resetPasswordExpiresAt = expiresAt;
  await userRepository.save(user);

  const appOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";
  const resetUrl = `${appOrigin}/reset-password?token=${rawToken}`;
  const emailBody = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
      <h2 style="margin-bottom: 16px;">Reset your PhinuxTV password</h2>
      <p>We received a request to reset your password. Use the link below to create a new one:</p>
      <p style="margin: 24px 0;">
        <a href="${resetUrl}" style="display: inline-block; background: #10b981; color: #00111a; text-decoration: none; padding: 12px 18px; border-radius: 10px; font-weight: 700;">Reset password</a>
      </p>
      <p>If the button does not work, copy and paste this URL into your browser:</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>This link expires in ${getResetTokenTtlMinutes()} minutes.</p>
    </div>
  `;

  await sendMail(user.email, "Reset your PhinuxTV password", emailBody);

  return {
    message:
      "If an account exists for this email, a password reset link has been generated.",
  };
}

async function resetPassword(dataSource, payload) {
  const userRepository = dataSource.getRepository("User");
  const token = String(payload.token || "");
  const nextPassword = String(payload.password || "");

  if (!token) {
    const error = new Error("Reset token is required");
    error.statusCode = 400;
    throw error;
  }

  if (nextPassword.length < 8) {
    const error = new Error("Password must be at least 8 characters");
    error.statusCode = 400;
    throw error;
  }

  const tokenHash = hashResetToken(token);
  const user = await userRepository.findOne({
    where: { resetPasswordTokenHash: tokenHash },
  });

  if (
    !user ||
    !user.resetPasswordExpiresAt ||
    user.resetPasswordExpiresAt < new Date()
  ) {
    const error = new Error("Reset token is invalid or expired");
    error.statusCode = 400;
    throw error;
  }

  user.passwordHash = await argon2.hash(nextPassword);
  user.resetPasswordTokenHash = null;
  user.resetPasswordExpiresAt = null;
  await userRepository.save(user);

  return { message: "Password reset successful" };
}

module.exports = {
  register,
  login,
  getCurrentUser,
  forgotPassword,
  resetPassword,
  toSafeUser,
};
