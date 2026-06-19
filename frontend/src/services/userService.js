import { supabase } from "../pages/admin/lib/supabase";


// =========================
// UTIL
// =========================

function cleanPhone(phone) {
  return (phone || "").replace(/\D/g, "");
}


function randomCode(size = 8) {
  const chars =
    "abcdefghijklmnopqrstuvwxyz0123456789";

  let result = "";

  for (let i = 0; i < size; i++) {
    result += chars[
      Math.floor(Math.random() * chars.length)
    ];
  }

  return result;
}


// =========================
// FIND REAL USER
// =========================

export async function findUserByPhone(phone) {

  const clean = cleanPhone(phone);

  const { data, error } =
    await supabase
      .from("users")
      .select("*")
      .eq("phone", clean)
      .maybeSingle();


  if (error) {
    console.error(
      "findUserByPhone:",
      error
    );
    return null;
  }


  return data;
}



// =========================
// CREATE GUEST USER
// =========================

export async function createGuestUser(input) {

  const clean = cleanPhone(input.phone);


  const uuidCode = randomCode(8);


  const payload = {

    full_name:
      input.fullName ||
      "CanGuest",


    user_name:
      input.userName ||
      `user_${uuidCode}`,


    phone:
      clean,


    email:
      input.email ||
      `guest_${uuidCode}@canguess.local`,


    status:
      "active"

  };



  const { data, error } =
    await supabase
      .from("guest_users")
      .insert(payload)
      .select()
      .single();



  if (error) {

    console.error(
      "createGuestUser:",
      error
    );

    return {
      ok:false,
      error
    };

  }



  return {
    ok:true,
    user:data
  };

}



