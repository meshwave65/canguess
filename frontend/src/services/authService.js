import { supabase } from "../pages/admin/lib/supabase";

// =========================
// HELPERS
// =========================
function randomBlock() {
  return Math.random().toString(36).substring(2, 8);
}

function buildIdentity(input) {
  const block = randomBlock();

  return {
    user_name: input.user_name || `user_${block}`,
    full_name: input.full_name || `CanGuess ${block}`,
    email: input.email || `${input.phone}@canguess.local`,
    phone: input.phone,
  };
}

// =========================
// AUTH SERVICE
// =========================
export const AuthService = {
  // =========================
  // REGISTER (GUEST + OPTIONAL AUTH)
  // =========================
  async register(input) {
    try {
      if (!input.phone) {
        return {
          ok: false,
          error: "Telefone é obrigatório",
        };
      }

      const data = buildIdentity(input);

      // =========================
      // 1. CHECK DUPLICATE
      // =========================
      const { data: existing, error: checkError } = await supabase
        .from("users")
        .select("id, phone, user_name")
        .or(
          `phone.eq.${data.phone},user_name.eq.${data.user_name}`
        )
        .maybeSingle();

      if (checkError) {
        return {
          ok: false,
          error: "Erro ao validar usuário",
        };
      }

      if (existing) {
        return {
          ok: false,
          error: "Telefone ou username já cadastrado",
        };
      }

      // =========================
      // 2. CREATE PROFILE (GUEST IDENTITY)
      // =========================
      const { data: profile, error: profileError } = await supabase
        .from("users")
        .insert({
          user_name: data.user_name,
          full_name: data.full_name,
          phone: data.phone,
          email: data.email,
        })
        .select()
        .single();

      if (profileError) {
        return {
          ok: false,
          error: "Erro ao criar perfil",
        };
      }

      // =========================
      // 3. OPTIONAL AUTH (SÓ SE PASSWORD EXISTIR)
      // =========================
      if (input.password) {
        const { error: authError } = await supabase.auth.signUp({
          email: data.email,
          password: input.password,
        });

        if (authError) {
          return {
            ok: false,
            error: authError.message,
          };
        }
      }

      // =========================
      // 4. SUCCESS
      // =========================
      return {
        ok: true,
        user: profile,
      };

    } catch (err) {
      return {
        ok: false,
        error: "Erro inesperado no registro",
      };
    }
  },

  // =========================
  // LOGIN
  // =========================
  async login(identifier, password) {
    try {
      const { data: user, error } = await supabase
        .from("users")
        .select("id, email, user_name")
        .or(
          `email.eq.${identifier},user_name.eq.${identifier},phone.eq.${identifier}`
        )
        .maybeSingle();

      if (error || !user) {
        return {
          ok: false,
          error: "Usuário não encontrado",
        };
      }

      const { data, error: authError } =
        await supabase.auth.signInWithPassword({
          email: user.email,
          password,
        });

      if (authError) {
        return {
          ok: false,
          error: "Senha inválida",
        };
      }

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
  // CURRENT USER
  // =========================
  async getCurrentUser() {
    const { data } = await supabase.auth.getUser();
    return data?.user || null;
  },
};
