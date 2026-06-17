import { supabase } from "../pages/admin/lib/supabase";

// =========================
// FIND USER
// =========================
export async function findUserByPhone(phone) {
  const clean = phone.replace(/\D/g, "");

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("phone", clean)
    .maybeSingle();

  if (error) return null;
  return data;
}

// =========================
// CREATE GUEST USER (SEM AUTH)
// =========================
export async function createUser(input) {
  const cleanPhone = (input.phone || "").replace(/\D/g, "");

  const payload = {
    user_name: input.userName || `user_${cleanPhone.slice(0, 6)}`,
    full_name: input.fullName || "Guest",
    phone: cleanPhone,
    email: input.email || null,

    // IMPORTANTÍSSIMO:
    password_hash: null,
    is_guest: true,
  };

  const { data, error } = await supabase
    .from("users")
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error("createUser error:", error);
    return { ok: false, error };
  }

  return { ok: true, user: data };
}
