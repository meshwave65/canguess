import { theme } from "../styles/theme";

export default function Home() {
  const styles = {
    bannerWrap: {
      position: "fixed",
      top: "80px",
      left: 0,
      width: "100%",
      height: "clamp(120px, 18vw, 220px)",
      background: "#fff",
      zIndex: 50,
      overflow: "hidden",
      boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },

    bannerImg: {
      width: "100%",
      height: "100%",
      objectFit: "contain",
    },
  };

  return (
    <>
      <Header />

      {/* ========================= */}
      {/* BANNER FIXO NO TOPO */}
      {/* ========================= */}

      <div style={styles.bannerWrap}>
        <img
          src="/assets/marketing/banners/Banner_patrocinado_Copa2026.png"
          alt="Evento patrocinado"
          style={styles.bannerImg}
        />
      </div>

      {/* ========================= */}
      {/* CONTEÚDO DA HOME */}
      {/* ========================= */}

      <main
        style={{
          paddingTop: "280px",
          paddingBottom: "80px",
        }}
        className="p-4 space-y-4"
      >
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
            <p><strong>1.</strong> Encontre eventos pelo botão no topo.</p>
            <p><strong>2.</strong> Entre no evento.</p>
            <p><strong>3.</strong> Faça seus palpites.</p>
          </div>
        </div>
      </main>

      <BottomNav />
    </>
  );
}
