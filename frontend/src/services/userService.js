import { supabase } from "../pages/admin/lib/supabase";


export async function findUserByPhone(phone) {

  const { data } = await supabase
    .from("users")
    .select("*")
    .eq("phone", phone)
    .maybeSingle();

  return data;
}


function generateUserName(uuid) {
  return `user_${uuid.substring(0,6)}`;
}


export async function createUser({
  fullName,
  userName,
  phone,
  email
}) {

  const { data, error } = await supabase
    .from("users")
    .insert({
      full_name: fullName || "Guest User",
      user_name: userName || "temp",
      phone,
      email: email || "unknown",
    })
    .select()
    .single();


  if(error) throw error;


  const temporaryPassword =
    data.id.substring(0,6);


  const finalUserName =
    userName || generateUserName(data.id);


  await supabase
    .from("users")
    .update({
      user_name: finalUserName
    })
    .eq("id", data.id);


  return {
    user: {
      ...data,
      user_name: finalUserName
    },
    temporaryPassword
  };
}
