import createClient from "./client";

interface UserProfile {
  id?: string;
  username: string;
  avatar?: string;
}

export async function upsertUser(profile: UserProfile) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("users")
    .upsert({ username: profile.username, avatar: profile.avatar })
    .select()
    .limit(1)
    .single();

  if (error) {
    console.error("upsertUser error", error);
    throw error;
  }

  return data;
}

export default upsertUser;
