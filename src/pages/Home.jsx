import Header from "../components/Header";

export default function Home() {
  return (
    <>
      <Header />

      <main className="p-4">
        <div className="bg-white rounded-xl shadow p-6 text-center">

          <h2 className="text-2xl font-bold text-red-700">
            Rodada 12
          </h2>

          <p className="mt-4">
            11 Jogos
          </p>

          <p>
            24 Participantes
          </p>

          <div className="mt-6 flex flex-col gap-3">

            <button
              className="
                bg-red-700
                text-white
                py-3
                rounded-lg
                font-bold
              "
            >
              Fazer Palpites
            </button>

            <button
              className="
                border
                border-red-700
                text-red-700
                py-3
                rounded-lg
                font-bold
              "
            >
              Ver Classificação
            </button>

          </div>

        </div>
      </main>
    </>
  );
}
