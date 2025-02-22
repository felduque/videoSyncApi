import jwt from "jsonwebtoken";
import AppError from "../utils/AppError.js";

export const verifyAccessToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
//   const token = authHeader && authHeader.split(" ")[1];
  if (!authHeader) {
    return next(new AppError("Access token required", 401));
  }

  try {
    const user = jwt.verify(authHeader, process.env.ACCESS_TOKEN_SECRET);
    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return next(new AppError("Token expired", 401));
    }
    return next(new AppError("Invalid token", 401));
  }
};
