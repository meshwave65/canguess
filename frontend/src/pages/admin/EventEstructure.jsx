import { useState } from "react";

export default function EventStructure() {
  // ---------------- MOCK STATES (UI ONLY) ----------------
  const [selectedPhase, setSelectedPhase] = useState("5");
  const [showRounds, setShowRounds] = useState(false);
  const [expandedRound, setExpandedRound] = useState(null);

  // ---------------- MOCK DATA ----------------
  const event = {
    name: "Copa do Mundo 2026",
    id: "9a838577-e64e-404b-80c0-8d3e1ef327df",
  };

  const phases = [
    { id: "1", label: "Fase de Grupos", rounds: 72 },
    { id: "5", label: "Semi Final", rounds: 2 },
    { id: "7", label: "Final", rounds: 1 },
  ];

  const rounds = [
    {
      id: "r1",
      name: "Brasil x Marrocos",
      date: "17/06/2026",
      time: "16:30",
      location: "Estádio Asteca",
      parts: 2,
    },
    {
      id: "r2",
      name: "Argentina x Alemanha",
      date: "18/06/2026",
      time: "17:00",
      location: "Maracanã",
      parts: 2,
    },
  ];

  const parts = [
    { id: "p1", label: "Brasil" },
    { id: "p2", label: "Marrocos" },
  ];

  // ---------------- STYLE ----------------
  const s = {
    page: { padding: 20, fontFamily: "Arial" },

    header: {
      marginBottom: 20,
      borderBottom: "1px solid #ddd",
      paddingBottom: 10,
    },

    title: { fontSize: 22, fontWeight: "bold" },
    uuid: { fontSize: 11, color: "#777" },

    box: {
      background: "#fff",
      border: "1px solid #ddd",
      padding: 12,
      borderRadius: 8,
      marginBottom: 10,
    },

    row: {
      display: "flex",
      gap: 10,
      alignItems: "center",
      flexWrap: "wrap",
    },

    input: {
      padding: 6,
      border: "1px solid #ccc",
      borderRadius: 6,
    },

    btn: {
      padding: "6px 10px",
      border: "1px solid #ccc",
      borderRadius: 6,
      background: "#fff",
      cursor: "pointer",
    },

    iconBtn: {
      padding: "6px 8px",
      border: "1px solid #ccc",
      borderRadius: 6,
      background: "#f8f8f8",
      cursor: "pointer",
    },
  };

  return (
    <div style={s.page}>
      {/* ---------------- EVENT HEADER ---------------- */}
      <div style={s.header}>
        <div style={s.title}>{event.name}</div>
        <div style={s.uuid}>{event.id}</div>
      </div>

      {/* ---------------- PHASE SELECT ---------------- */}
      <div style={s.box}>
        <h3>FASE</h3>

        <div style={s.row}>
            <select
                style={s.input}
                value={selectedPhase}
                onChange={(e) => setSelectedPhase(e.target.value)}
            >
            {phases.map((p) => (
                <option key={p.id} value={p.id}>
                    Fase {p.phase_number ?? "-"} - {p.phase_name ?? "Sem nome"}
                </option>
            ))}
            </select>
        </div>
          <input
            style={s.input}
            placeholder="Nome da fase"
            defaultValue="Semi Final"
          />

          <input
            style={s.input}
            placeholder="Nº Rounds"
            defaultValue="2"
          />

          <button style={s.iconBtn}>💾</button>

          <button
            style={s.iconBtn}
            onClick={() => setShowRounds(!showRounds)}
          >
            📂
          </button>
        </div>
      </div>

      {/* ---------------- ROUNDS ---------------- */}
      {showRounds && (
        <div style={s.box}>
          <h3>ROUNDS (FASE {selectedPhase})</h3>

          {rounds.map((r) => (
            <div key={r.id} style={{ ...s.box, background: "#fafafa" }}>
              <div style={s.row}>
                <strong>{r.name}</strong>

                <input style={s.input} defaultValue={r.date} />
                <input style={s.input} defaultValue={r.time} />
                <input style={s.input} defaultValue={r.location} />
                <input style={s.input} defaultValue={r.parts} />

                <button style={s.iconBtn}>💾</button>

                <button
                  style={s.iconBtn}
                  onClick={() =>
                    setExpandedRound(
                      expandedRound === r.id ? null : r.id
                    )
                  }
                >
                  📂
                </button>
              </div>

              {/* ---------------- PARTS ---------------- */}
              {expandedRound === r.id && (
                <div style={{ marginTop: 10 }}>
                  <h4>PARTS</h4>

                  {parts.map((p) => (
                    <div key={p.id} style={s.row}>
                      <span>{p.id}</span>
                      <input style={s.input} defaultValue={p.label} />
                      <button style={s.iconBtn}>💾</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
