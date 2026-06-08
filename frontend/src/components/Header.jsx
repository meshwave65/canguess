export default function Header() {
  return (
    <header
      style={{
        backgroundColor: "#0B3C49", // azul petróleo
        color: "#FFFFFF",
        padding: "12px 16px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
        borderBottom: "4px solid #FF6A00", // laranja intenso
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <img
          src="/canguess-logo-1024.png"
          alt="CanGuess"
          style={{
            width: "65px",
            height: "65px",
            objectFit: "contain",
          }}
        />

        <div>
          <h1
            style={{
              margin: 0,
              fontSize: "1.7rem",
              fontWeight: "bold",
            }}
          >
            CanGuess
          </h1>

          <p
            style={{
              margin: 0,
              fontSize: "0.8rem",
              color: "#FFD2B3",
            }}
          >
            Já deu seu palpite hoje?
          </p>
        </div>
      </div>
    </header>
  );
}
