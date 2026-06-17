import { supabase } from "../pages/admin/lib/supabase";

/**
 * Buscar usuário por telefone
 */
export async function findUserByPhone(phone) {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("phone", phone)
    .maybeSingle();

  if (error) throw error;

  return data;
}

/**
 * Gerar username automático
 */
function generateUserName(uuid) {
  return `user_${uuid.substring(0, 6)}`;
}

/**
 * Criar usuário (MVP + password)
 */
export async function createUser({
  fullName,
  userName,
  phone,
  email,
  password
}) {
  // =========================
  // 1. INSERT BASE
  // =========================
  const { data, error } = await supabase
    .from("users")
    .insert({
      full_name: fullName || "Guest User",
      user_name: userName || "temp",
      phone,
      email: email || null,

      // 🔐 NOVO CAMPO
      password: password || null,
    })
    .select()
    .single();

  if (error) throw error;

  // =========================
  // 2. GERAR DADOS DERIVADOS
  // =========================
  const temporaryPassword = data.id.substring(0, 6);

  const finalUserName =
    userName || generateUserName(data.id);

  // =========================
  // 3. UPDATE USERNAME FINAL
  // =========================
  const { error: updateError } = await supabase
    .from("users")
    .update({
      user_name: finalUserName,
      password: password || temporaryPassword
    })
    .eq("id", data.id);

  if (updateError) throw updateError;

  // =========================
  // 4. RETURN FINAL USER
  // =========================
  return {
    user: {
      ...data,
      user_name: finalUserName,
      password: password || temporaryPassword
    },
    temporaryPassword
  };
}
