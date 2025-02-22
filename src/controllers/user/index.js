import bcrypt from "bcrypt";
import supabase from "../../database/database.js";
import { userExists, createAuthenticationTokens } from "./utils.js";
import AppError from "../../utils/AppError.js";
import jwt from "jsonwebtoken";
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

const refreshAccessToken = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    
    if (!refreshToken) {
      return next(new AppError('Refresh token required', 401));
    }

    // Verificar si el refresh token existe y es válido en la base de datos
    const { data: tokenData, error: tokenError } = await supabase
      .from('refresh_tokens')
      .select('*')
      .eq('token', refreshToken)
      .eq('is_revoked', false)
      .single();

    if (tokenError || !tokenData) {
      res.clearCookie('refreshToken');
      return next(new AppError('Invalid refresh token', 401));
    }

    // Verificar si el token ha expirado
    if (new Date(tokenData.expires_at) < new Date()) {
      // Marcar el token como revocado
      await supabase
        .from('refresh_tokens')
        .update({ is_revoked: true })
        .eq('token', refreshToken);

      res.clearCookie('refreshToken');
      return next(new AppError('Refresh token expired', 401));
    }

    // Obtener datos del usuario
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, username, email, avatar_url')
      .eq('id', tokenData.user_id)
      .single();

    if (userError) {
      return next(new AppError('User not found', 404));
    }

    // Generar nuevo access token
    const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: '15m',
    });

    res.json({
      status: 'success',
      data: {
        tkAccess: accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

export { register, login, refreshAccessToken };
