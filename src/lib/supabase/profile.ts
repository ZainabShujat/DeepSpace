import createClient from "./client";

interface Profile {
  id: string;
  username?: string;
  avatar?: string;
}

export async function upsertProfile(profile: Profile) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("users")
    .upsert({ id: profile.id, username: profile.username, avatar: profile.avatar }, { onConflict: "id" })
    .select()
    .single();

  if (error) {
    console.error("upsertProfile error", error);
    throw error;
  }

  return data;
}

export default upsertProfile;
