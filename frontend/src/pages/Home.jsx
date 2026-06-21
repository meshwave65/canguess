import { theme } from "../styles/theme";
import Header from "../components/Header";
import { useNavigate } from "react-router-dom";

export default function Home() {

  const navigate = useNavigate();

  return (
    <>

      {/* HEADER FIXO */}
      <Header />


      {/* BANNER */}
      <div
        style={styles.banner}
      >
        <img
          src="/assets/marketing/banners/Banner_patrocinado_Copa2026.png"
          alt="CanGuess"
          style={styles.bannerImage}
        />
      </div>


      {/* CONTEÚDO */}
      <main style={styles.page}>


        {/* HERO */}
        <section style={styles.cardHero}>

          <div style={styles.ball}>
            ⚽
          </div>

          <h1 style={styles.title}>
            CanGuess
          </h1>

          <p style={styles.subtitle}>
            Eventos Preditivos Inteligentes
          </p>


          <p style={styles.heroText}>
            Conectando pessoas através da curiosidade
            e da diversão.
          </p>


          <button
            style={styles.primaryBtn}
            onClick={() => navigate("/events")}
          >
            🎯 EXPLORAR EVENTOS
          </button>

        </section>



        {/* ESPÍRITO CANGUESS */}
        <section style={styles.card}>

          <h2 style={styles.sectionTitle}>
            O Espírito CanGuess
          </h2>


          <p style={styles.text}>
            Na CanGuess, enxergamos além dos números
            e das probabilidades.
          </p>


          <p style={styles.text}>
            Nossa plataforma nasceu de uma ideia simples:
            transformar a curiosidade humana em um
            catalisador para interação social genuína
            e diversão compartilhada.
          </p>


          <p style={styles.text}>
            Aqui, prever não é apenas acertar um resultado.
            É criar momentos, conversar, competir,
            brincar e fortalecer conexões.
          </p>

        </section>



        {/* COMO FUNCIONA */}
        <section style={styles.card}>

          <h2 style={styles.sectionTitle}>
            Como funciona?
          </h2>


          <div style={styles.step}>
            <strong>1️⃣ Escolha um evento</strong>
            <span>
              Futebol, desafios entre amigos,
              acontecimentos sociais ou qualquer
              evento previsível.
            </span>
          </div>


          <div style={styles.step}>
            <strong>2️⃣ Faça sua previsão</strong>
            <span>
              Registre seu palpite e participe
              da competição.
            </span>
          </div>


          <div style={styles.step}>
            <strong>3️⃣ Acompanhe os resultados</strong>
            <span>
              Veja rankings, desempenhos e
              descubra quem entende mais do assunto.
            </span>
          </div>

        </section>

        {/* WORKSPACES CONCEITO */}
        <section style={styles.card}>

        <h2 style={styles.sectionTitle}>
            Crie seu próprio universo
        </h2>

        <p style={styles.text}>
            Na CanGuess, qualquer pessoa pode criar seu próprio workspace.
        </p>

        <p style={styles.text}>
            Um workspace é o seu espaço privado ou público dentro da plataforma,
            onde você define eventos, regras e convida pessoas para participar.
        </p>

        <p style={styles.text}>
            Pode ser o “Bolão do Zé”, o “Clube da Firma”, um grupo de amigos,
            ou até uma comunidade inteira.
        </p>

        <p style={styles.text}>
            Cada workspace é independente — com seus próprios eventos,
            rankings e dinâmica de jogo.
        </p>

        </section>

        {/* POSSIBILIDADES */}
        <section style={styles.card}>

          <h2 style={styles.sectionTitle}>
            Qualquer previsão pode virar uma experiência
          </h2>


          <div style={styles.tags}>

            <span>⚽ Futebol</span>
            <span>👶 Eventos familiares</span>
            <span>📈 Economia</span>
            <span>🎤 Shows</span>
            <span>🏆 Competições</span>
            <span>💡 Ideias criativas</span>

          </div>

        </section>



        {/* MANIFESTO */}
        <section style={styles.cardHighlight}>

          <h2 style={styles.sectionTitle}>
            Muito além de uma aposta
          </h2>


          <p style={styles.text}>
            A CanGuess acredita que a verdadeira
            recompensa está nos momentos criados,
            nas conversas geradas e nas conexões
            fortalecidas.
          </p>


          <p style={styles.text}>
            O resultado é apenas uma parte da história.
            A experiência acontece antes, durante
            e depois da previsão.
          </p>

        </section>


      </main>

    </>
  );
}



/* =========================
   IDENTIDADE VISUAL CANGUESS
========================= */


const styles = {


  banner: {
    position: "fixed",
    top: "80px",
    left: 0,
    width: "100%",
    height: "clamp(120px,18vw,220px)",
    background: "#fff",
    zIndex: 20,
    overflow: "hidden",
    boxShadow:
      "0 2px 8px rgba(0,0,0,.15)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },


  bannerImage: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
  },


  page: {

    minHeight: "100vh",

    paddingTop: "300px",

    paddingBottom: "100px",

    paddingLeft: 16,

    paddingRight: 16,

    background: "#0B3C49",

    display: "flex",

    flexDirection: "column",

    alignItems: "center",

    gap: 16,

  },


  cardHero: {

    width: "100%",

    maxWidth: 520,

    background:"#fff",

    borderRadius:18,

    padding:28,

    textAlign:"center",

    boxShadow:
      "0 20px 40px rgba(0,0,0,.25)",

  },


  card: {

    width:"100%",

    maxWidth:520,

    background:"#fff",

    borderRadius:18,

    padding:24,

    boxShadow:
      "0 10px 25px rgba(0,0,0,.15)",

  },


  cardHighlight: {

    width:"100%",

    maxWidth:520,

    background:"#fff7ed",

    borderRadius:18,

    padding:24,

    boxShadow:
      "0 10px 25px rgba(0,0,0,.12)",

  },


  ball:{
    fontSize:48,
  },


  title:{

    margin:0,

    color:"#0B3C49",

    fontSize:32,

    fontWeight:"800",

  },


  subtitle:{

    color:"#6b7280",

    fontSize:14,

  },


  heroText:{

    marginTop:18,

    fontSize:18,

    fontWeight:"600",

    color:"#0B3C49",

  },


  sectionTitle:{

    color:"#0B3C49",

    fontSize:18,

    fontWeight:"800",

    marginBottom:12,

  },


  text:{

    fontSize:14,

    lineHeight:"1.6",

    color:"#374151",

  },


  step:{

    display:"flex",

    flexDirection:"column",

    gap:4,

    marginBottom:14,

    fontSize:14,

  },


  tags:{

    display:"flex",

    flexWrap:"wrap",

    gap:8,

  },


  primaryBtn:{

    width:"100%",

    padding:14,

    marginTop:20,

    background:"#f97316",

    color:"#fff",

    border:"none",

    borderRadius:10,

    fontWeight:"bold",

    cursor:"pointer",

  },


};
