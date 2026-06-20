import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

export default function EventHome() {
  const [params] = useSearchParams();
  const code = params.get("code");

  const [manifest, setManifest] = useState(null);
  const [content, setContent] = useState({
    intro: "",
    rules: "",
    general: ""
  });

  const [loading, setLoading] = useState(true);

  // =========================
  // GLOBAL CONTEXT
  // =========================
  useEffect(() => {
    if (code) {
      window.CANGUESS_EVENT_CODE = code;
    }
  }, [code]);

  // =========================
  // LOAD MANIFEST + FILES
  // =========================
  useEffect(() => {
    if (!code) return;

    async function load() {
      try {
        setLoading(true);

        // 1. LOAD MANIFEST
        const res = await fetch(`/data/events/Manifest.${code}.json`);
        const data = await res.json();

        setManifest(data);

        // base path dos assets
        const loadText = async (path) => {
          if (!path) return "";
          const r = await fetch(path);
          return await r.text();
        };

        // 2. LOAD ALL CONTENT IN PARALLEL
        const [intro, rules, general] = await Promise.all([
          loadText(data.intro),
          loadText(data.rules),
          loadText(data.general)
        ]);

        setContent({ intro, rules, general });

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [code]);

  // =========================
  // GUARDS
  // =========================
  if (!code) return <div style={styles.box}>Código do evento não informado</div>;
  if (loading) return <div style={styles.box}>Carregando evento...</div>;
  if (!manifest) return <div style={styles.box}>Evento não encontrado</div>;

  // =========================
  // UI
  // =========================
  return (
    <div style={styles.page}>

      {/* BANNER */}
      <div style={styles.bannerWrap}>
        <img
          src={manifest.banner}
          alt="banner"
          style={styles.banner}
        />
      </div>

      {/* HEADER */}
      <div style={styles.header}>
        <h1 style={styles.title}>{manifest.event_name}</h1>

        <p style={styles.subtitle}>
          Workspace: <b>{manifest.workspace_name}</b>
        </p>

        <p style={styles.code}>
          Event Code: <b>{manifest.code}</b>
        </p>
      </div>

      {/* INTRO */}
      <div style={styles.card}>
        <h3>Introdução</h3>
        <pre style={styles.content}>{content.intro}</pre>
      </div>

      {/* RULES */}
      <div style={styles.card}>
        <h3>Regras</h3>
        <pre style={styles.content}>{content.rules}</pre>
      </div>

      {/* GENERAL */}
      <div style={styles.card}>
        <h3>Informações Gerais</h3>
        <pre style={styles.content}>{content.general}</pre>
      </div>

    </div>
  );
}

/* ========================= */

const styles = {
  page: {
    padding: 16,
    fontFamily: "Arial",
    background: "#f6f7f9"
  },

  box: {
    padding: 40,
    textAlign: "center"
  },

  bannerWrap: {
    width: "100%",
    marginBottom: 16
  },

  banner: {
    width: "100%",
    borderRadius: 12,
    objectFit: "cover"
  },

  header: {
    background: "#0B3C49",
    color: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16
  },

  title: {
    margin: 0
  },

  subtitle: {
    margin: "4px 0",
    opacity: 0.85
  },

  code: {
    fontSize: 12,
    opacity: 0.7
  },

  card: {
    background: "#fff",
    padding: 14,
    borderRadius: 10,
    border: "1px solid #ddd",
    marginBottom: 12
  },

  content: {
    whiteSpace: "pre-wrap",
    fontSize: 13
  }
};
