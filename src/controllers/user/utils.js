import jwt from "jsonwebtoken";
import supabase from "../../database/database.js";
import AppError from "../../utils/AppError.js";

const generateAccessToken = (user) => {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });
};
const generateRefreshToken = (user) => {
  const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "30d",
  });
  if (!refreshToken) throw new AppError("Failed to generate refresh token", 500);
  return refreshToken;
};

const createAuthenticationTokens = async (user, req) => {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  const { error: tokenError } = await supabase.from("refresh_tokens").insert({
    user_id: user.id,
    token: refreshToken,
    browser: req.headers["user-agent"],
    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
  });

  if (tokenError) throw tokenError;

  return { tkAccess: accessToken, tkRefresh: refreshToken };
}

const userExists = async (data, next) => {
  try {
    const { username, email } = data;

    const [userExists, emailExists] = await Promise.all([
      supabase.from("users").select("username").eq("username", username),
      supabase.from("users").select("email").eq("email", email),
    ]);
    if (userExists.data.length > 0)
      return next(new AppError("Username already exists", 400));
    if (emailExists.data.length > 0)
      return next(new AppError("Email already exists", 400));
    return true;
  } catch (error) {
    next(error);
  }
};

export { userExists, createAuthenticationTokens };


