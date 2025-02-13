import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import supabase from "../../database/database.js";
import { userExists, createAuthenticationTokens } from "./utils.js";
import AppError from "../../utils/AppError.js";

const register = async (req, res, next) => {
  const { username, email, password } = req.body;
  try {
    const dataAvailable = await userExists({ username, email }, next);
    if (dataAvailable) {
      const hashedPassword = await bcrypt.hash(password, 10);
      const { data, error } = await supabase
        .from("users")
        .insert({ username, email, password: hashedPassword })
        .select('id, username, email, avatar_url')
        .single();

      if (error) throw error;

      const { tkAccess, tkRefresh } = await createAuthenticationTokens(data, req);

      res.cookie("refreshToken", tkRefresh, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });
      res.json({ 
        status: "success",
        message: "User registered successfully",
        data: {
          tkAccess,
        }
       });
    }
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (error || !user) return next(new AppError("Invalid Credentials", 400));

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return next(new AppError("Invalid Credentials", 400));

    const { tkAccess, tkRefresh } = await createAuthenticationTokens({
      id: user.id,
      username: user.username,
      email: user.email,
      avatar_url: user.avatar_url,
    }, req);

    res.cookie("refreshToken", tkRefresh, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    res.json({ 
      status: "success",
      message: "User login successfully",
      data: {
        tkAccess,
      }
     });
  } catch (err) {
    next(err);
  }
};

export { register, login };
