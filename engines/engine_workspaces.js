// engine_workspaces.js
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://SUA_URL_AQUI.supabase.co';           // ← COLOQUE AQUI
const SUPABASE_KEY = 'SUA_CHAVE_ANON_OU_SERVICE_ROLE_AQUI';        // ← COLOQUE AQUI

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function main() {
  console.log("🚀 Iniciando Engine Workspaces...");

  try {
    const { data, error } = await supabase
      .from('workspaces')
      .select('*')
      .limit(10);

    if (error) throw error;

    console.log("✅ Conexão com Supabase OK!");
    console.log(`Workspaces encontrados: ${data.length}`);

  } catch (err) {
    console.error("❌ Erro:", err.message);
  }
}

main();
