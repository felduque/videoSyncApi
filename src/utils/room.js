import supabase from "../database/database.js";
import AppError from "./AppError.js";

const validateRoomInput = (name, description) => {
    if (name && (typeof name !== "string" || name.length < 3 || name.length > 50)) {
      throw new AppError("Room name must be between 3 and 50 characters", 400);
    }
  
    if (description && (typeof description !== "string" || description.length > 200)) {
      throw new AppError("Description must not exceed 200 characters", 400);
    }
  };
  
  const createRoomWithMembers = async (name, description, userId) => {
    const { data: room, error } = await supabase
      .from("rooms")
      .insert({
        name: name || `Room ${Math.floor(Math.random() * 1000)}`,
        description: description || "Room description",
        host_id: userId,
      })
      .select("*")
      .single();
  
    if (error) {
      throw new AppError(
        error.message || "Error creating room",
        error.code === "23505" ? 409 : 500
      );
    }
  
    if (!room) throw new AppError("Room creation failed", 500);
  
    try {
      await supabase.from("room_members").insert({
        room_id: room.id,
        user_id: room.host_id,
      });
    } catch (error) {
      await supabase.from("rooms").delete().eq("id", room.id);
      throw new AppError("Error adding user to room", 500);
    }
  
    return room;
  };
  
export {
    validateRoomInput,
    createRoomWithMembers
}