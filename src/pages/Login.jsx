export default function Login() {
  return (
    <div
      className="
        min-h-screen
        flex
        items-center
        justify-center
        bg-white
      "
    >
      <div className="w-full max-w-sm p-6">

        <div className="text-center">

          <div className="text-6xl">
            ⚽
          </div>

          <h1 className="text-3xl font-bold text-red-700 mt-4">
            BOLÃO
          </h1>

          <h2 className="text-xl">
            ZÉ BANGU
          </h2>

        </div>

        <div className="mt-8">

          <input
            placeholder="User Name"
            className="
              w-full
              border
              rounded-lg
              p-3
              mb-3
            "
          />

          <input
            placeholder="Telefone"
            className="
              w-full
              border
              rounded-lg
              p-3
            "
          />

          <button
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

        </div>

      </div>
    </div>
  );
}
