import supabase from "../database/database.js";
import AppError from "./AppError.js";

const createPlaylistForRoom = async (roomId, userId) => {
    const { data: playlist, error: playlistError } = await supabase
      .from("playlists")
      .insert({
        name: "Default Playlist",
        created_by: userId,
      })
      .select("*")
      .single();
  
    if (playlistError) throw new AppError("Error creating playlist", 500);
    if (!playlist) throw new AppError("Playlist creation failed", 500);
  
    try {
      await supabase
        .from("room_playlists")
        .insert({
          room_id: roomId,
          playlist_id: playlist.id,
        });
    } catch (error) {
      await supabase.from("playlists").delete().eq("id", playlist.id);
      throw new AppError("Error adding playlist to room", 500);
    }
  
    return playlist;
  };
  
  export {
    createPlaylistForRoom
  }