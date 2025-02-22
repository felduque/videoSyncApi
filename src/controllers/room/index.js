import supabase from "../../database/database.js";
import AppError from "../../utils/AppError.js";
import { createPlaylistForRoom } from "../../utils/playlist.js";
import { createRoomWithMembers, validateRoomInput } from "../../utils/room.js";

const createRoom = async (req, res, next) => {
  const { name, description } = req.body;
  const user = req.user;

  try {
    if (!user?.id) {
      throw new AppError("User not authenticated", 401);
    }

    validateRoomInput(name, description);

    const room = await createRoomWithMembers(name, description, user.id);
    await createPlaylistForRoom(room.id, user.id);

    res.status(201).json({
      status: "success",
      message: "Room created successfully",
      data: {
        room_id: room.id,
      },
    });
  } catch (error) {
    next(
      error instanceof AppError
        ? error
        : new AppError("Internal server error", 500)
    );
  }
};

const getRoom = async (req, res, next) => {
  const roomId = req.params.roomId;
  const user = req.user;

  try {
    if (!user?.id) {
      throw new AppError("User not authenticated", 401);
    }
    console.log(roomId, user.id)
    // Verificar si el usuario es miembro de la sala
    const { data: membership, error: membershipError } = await supabase
      .from("room_members")
      .select("*")
      .eq("room_id", roomId)
      .eq("user_id", user.id)
      .single();

    console.log(membership, "membership");
    console.log(membershipError, "Errormembership");
    if (membershipError || !membership) {
      throw new AppError("Access denied", 403);
    }
    console.log("22");
    // Obtener información de la sala y sus relaciones
    const { data: room, error: roomError } = await supabase
      .from("rooms")
      .select(
        `
        *,
        host: host_id (id, username, avatar_url),
        members: room_members (
          user: users (id, username, avatar_url)
        ),
        playlists: room_playlists (
          playlist: playlists (
            id,
            name,
            created_by,
            videos (
              id,
              url,
              title,
              platform,
              position
            )
          )
        )
      `
      )
      .eq("id", roomId)
      .single();

    console.log(room, "dataaaaaaa");
    console.log(roomError, "dataaaaaaa");

    if (roomError || !room) {
      throw new AppError("Room not found", 404);
    }

    // Formatear la respuesta
    const formattedRoom = {
      ...room,
      members: room.members.map((m) => m.user),
      playlists: room.playlists.map((p) => ({
        ...p.playlist,
        videos: p.playlist.videos.sort((a, b) => a.position - b.position),
      })),
    };

    console.log(3);

    res.json({
      status: "success",
      data: formattedRoom,
    });
  } catch (error) {
    next(
      error instanceof AppError
        ? error
        : new AppError("Internal server error", 500)
    );
  }
};

export { createRoom, getRoom };
