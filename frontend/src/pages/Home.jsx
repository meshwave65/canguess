import Header from "../components/Header";
import BottomNav from "../components/BottomNav";
import { theme } from "../styles/theme";

export default function Home() {
  return (
    <>
      <Header />

      <main className="p-4 space-y-4">

        {/* HERO */}
        <div className="bg-white rounded-xl shadow p-6 text-center">

          <h1
            className="text-2xl font-bold"
            style={{ color: theme.colors.primary }}
          >
            Descubra eventos e faça seus palpites
          </h1>

          <p className="mt-3 text-gray-600 text-sm">
            Escolha eventos, entenda as regras e participe de forma simples.
          </p>

          <button
            className="mt-5 text-white py-3 px-6 rounded-lg font-bold w-full shadow-sm"
            style={{ backgroundColor: theme.colors.accent }}
            onMouseEnter={(e) =>
              e.currentTarget.style.backgroundColor = theme.colors.accentHover
            }
            onMouseLeave={(e) =>
              e.currentTarget.style.backgroundColor = theme.colors.accent
            }
          >
            Explorar Palpites
          </button>

        </div>

        {/* COMO FUNCIONA */}
        <div className="bg-white rounded-xl shadow p-6">

          <h2
            className="text-lg font-bold mb-4"
            style={{ color: theme.colors.primary }}
          >
            Como funciona
          </h2>

          <div className="space-y-3 text-sm text-gray-700">

            <p>
              <strong>1.</strong> Use filtros para encontrar eventos do seu interesse (tipo, mês e workspace).
            </p>

            <p>
              <strong>2.</strong> Veja a lista de eventos com informações básicas e escolha um.
            </p>

            <p>
              <strong>3.</strong> Leia as regras do evento e clique em <strong>“Palpitar”</strong> para participar.
            </p>

          </div>

        </div>

        {/* WORKSPACE / CRIADORES */}
        <div className="bg-white rounded-xl shadow p-6 text-center">

          <h2
            className="text-lg font-bold"
            style={{ color: theme.colors.primary }}
          >
            Quer criar seus próprios eventos?
          </h2>

          <p className="mt-3 text-sm text-gray-600">
            Usuários podem criar e gerenciar seus próprios eventos através de um Workspace.
            Você pode organizar palpites, definir regras, valores e compartilhar com outros usuários.
          </p>

          <button
            onClick={() => window.location.href = "/workspace-info"}
            className="mt-5 py-3 px-6 rounded-lg font-bold w-full border"
            style={{
              borderColor: theme.colors.primary,
              color: theme.colors.primary,
            }}
          >
            Saiba como funciona o Workspace
          </button>

        </div>

        {/* DESTAQUE DO SISTEMA */}
        <div className="bg-white rounded-xl shadow p-6 text-center">

          <h3
            className="text-lg font-bold"
            style={{ color: theme.colors.primary }}
          >
            Eventos em destaque
          </h3>

          <p className="mt-2 text-gray-500 text-sm">
            Explore os eventos mais recentes disponíveis para palpites.
          </p>

          <div className="mt-4 flex flex-col gap-2">

            <button
              className="py-3 rounded-lg font-bold border"
              style={{
                borderColor: theme.colors.primary,
                color: theme.colors.primary,
              }}
            >
              Ver eventos
            </button>

            <button
              className="py-3 rounded-lg font-bold text-white"
              style={{ backgroundColor: theme.colors.accent }}
            >
              Ver meus palpites
            </button>

          </div>

        </div>

      </main>

      <BottomNav />
    </>
  );
}
