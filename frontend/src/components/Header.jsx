export default function Header() {
  return (
    <header
      style={{
        backgroundColor: "#C1121F",
        color: "#FFFFFF",
        padding: "12px 16px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
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
          src="/escudo-bangu.png"
          alt="Escudo do Bangu"
          style={{
            width: "48px",
            height: "48px",
            objectFit: "contain",
          }}
        />

        <div>
          <h1
            style={{
              margin: 0,
              fontSize: "1.2rem",
              fontWeight: "bold",
            }}
          >
            BOLÃO ZÉ BANGU
          </h1>

          <p
            style={{
              margin: 0,
              fontSize: "0.8rem",
              opacity: 0.9,
            }}
          >
            O palpite da galera
          </p>
        </div>
      </div>
    </header>
  );
}
