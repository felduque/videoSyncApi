import { Router } from "express";
import { createRoom, getRoom } from "../controllers/room/index.js";
import { verifyAccessToken } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/room", verifyAccessToken, createRoom);
router.get("/room/:roomId", verifyAccessToken, getRoom);
export default router;

// Verificar si el usuario ya tiene demasiadas rooms
// const { count: userRoomsCount, error: countError } = await supabase
//   .from("rooms")
//   .select('*', { count: 'exact', head: true })
//   .eq('host_id', user.id);

// if (countError) {
//   throw new AppError('Error checking user rooms', 500);
// }

// if (userRoomsCount >= 10) { // Límite arbitrario, ajustar según necesidades
//   throw new AppError('User has reached maximum number of rooms', 400);
// }
