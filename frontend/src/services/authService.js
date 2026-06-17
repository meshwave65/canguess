import { supabase } from "../lib/supabase";

export const AuthService = {
  // =========================
  // LOGIN (user_name OR email)
  // =========================
  async login(identifier, password) {
    try {
      if (!identifier || !password) {
        return {
          ok: false,
          error: "Preencha usuário/email e senha",
        };
      }

      // 1. pré-check no banco de usuários
      const { data: user, error } = await supabase
        .from("users")
        .select("id, email, user_name")
        .or(`email.eq.${identifier},user_name.eq.${identifier}`)
        .maybeSingle();

      if (error) {
        return {
          ok: false,
          error: "Erro ao verificar usuário",
        };
      }

      if (!user) {
        return {
          ok: false,
          error: "Usuário ou e-mail não cadastrado",
        };
      }

      // 2. login no Supabase Auth
      const { data, error: authError } =
        await supabase.auth.signInWithPassword({
          email: user.email,
          password,
        });

      if (authError) {
        return {
          ok: false,
          error: "Senha incorreta",
        };
      }

      // 3. sucesso
      return {
        ok: true,
        user: data.user,
        session: data.session,
      };
    } catch (err) {
      return {
        ok: false,
        error: "Erro inesperado no login",
      };
    }
  },

  // =========================
  // LOGOUT
  // =========================
  async logout() {
    await supabase.auth.signOut();
  },

  // =========================
  // GET CURRENT USER
  // =========================
  async getCurrentUser() {
    const { data } = await supabase.auth.getUser();
    return data?.user || null;
  },
};
