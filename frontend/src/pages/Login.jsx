import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin() {
    // TODO:
    // Validar usuário
    // Buscar usuário no Supabase
    // Validar senha
    // Criar sessão

    console.log({
      userName,
      password,
    });

    navigate("/home");
  }

  return (
    <div
      className="
        min-h-screen
        flex
        items-center
        justify-center
        bg-white
        pb-20
      "
    >
      <div className="w-full max-w-sm p-6">

        <div className="text-center">

          <div className="text-6xl">
            ⚽
          </div>

          <h1 className="text-3xl font-bold text-red-700 mt-4">
            MUNDIVINUS
          </h1>

          <h2 className="text-lg text-gray-600 mt-2">
            Eventos Preditivos
          </h2>

        </div>

        <div className="mt-8">

          <input
            type="text"
            placeholder="User Name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="
              w-full
              border
              rounded-lg
              p-3
              mb-3
            "
          />

          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="
              w-full
              border
              rounded-lg
              p-3
            "
          />

          <button
            onClick={handleLogin}
            className="
              w-full
              mt-4
              bg-red-700
              text-white
              p-3
              rounded-lg
              font-bold
            "
          >
            ENTRAR
          </button>

          <button
            onClick={() => navigate("/register")}
            className="
              w-full
              mt-3
              border
              border-gray-300
              p-3
              rounded-lg
              font-bold
            "
          >
            CRIAR CONTA
          </button>

          <button
            onClick={() => navigate("/forgot-password")}
            className="
              w-full
              mt-3
              text-sm
              text-blue-600
            "
          >
            Esqueci minha senha
          </button>

        </div>

      </div>

      <BottomNav />
    </div>
  );
}

