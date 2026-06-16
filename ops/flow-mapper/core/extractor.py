import json
import os

def generate_initial_graph():
    # Baseado na análise manual dos arquivos AppRoutes.jsx, BottomNav.jsx, AdminLayout.jsx
    graph = {
        "nodes": [
            {"id": "/", "label": "Home", "type": "public"},
            {"id": "/login", "label": "Login", "type": "public"},
            {"id": "/palpites", "label": "Palpites", "type": "public"},
            {"id": "/ranking", "label": "Ranking", "type": "public"},
            {"id": "/admin-login", "label": "Admin Login", "type": "admin_auth"},
            {"id": "/admin", "label": "Admin Dashboard", "type": "admin_protected"},
            {"id": "/admin/usuarios", "label": "Usuários", "type": "admin_protected"},
            {"id": "/admin/palpites", "label": "Mapa de Palpites", "type": "admin_protected"},
            {"id": "/admin/cadastros", "label": "Cadastros Home", "type": "admin_protected"},
            {"id": "/admin/cadastros/times", "label": "Cadastro Times", "type": "admin_protected"},
            {"id": "/admin/cadastros/eventos", "label": "Cadastro Eventos", "type": "admin_protected"},
            {"id": "/admin/cadastros/rodadas", "label": "Cadastro Rodadas", "type": "admin_protected"},
            {"id": "/admin/cadastros/fases", "label": "Cadastro Fases", "type": "admin_protected"},
            {"id": "/admin/resultados", "label": "Resultados", "type": "admin_protected"},
            {"id": "/admin/consultas", "label": "Consultas", "type": "admin_protected"},
            {"id": "/events", "label": "Eventos (Orphan/Drift)", "type": "drift"}
        ],
        "edges": [
            {"source": "/", "target": "/palpites", "label": "BottomNav"},
            {"source": "/", "target": "/ranking", "label": "BottomNav"},
            {"source": "/", "target": "/admin-login", "label": "BottomNav"},
            {"source": "/", "target": "/login", "label": "Header"},
            {"source": "/", "target": "/events", "label": "Header (Drift)"},
            {"source": "/admin-login", "target": "/admin", "label": "Auth Success"},
            {"source": "/admin", "target": "/admin/usuarios", "label": "Sidebar"},
            {"source": "/admin", "target": "/admin/palpites", "label": "Sidebar"},
            {"source": "/admin", "target": "/admin/cadastros", "label": "Sidebar"},
            {"source": "/admin/cadastros", "target": "/admin/cadastros/times", "label": "Menu"},
            {"source": "/admin/cadastros", "target": "/admin/cadastros/eventos", "label": "Menu"},
            {"source": "/admin/cadastros", "target": "/admin/cadastros/rodadas", "label": "Menu"},
            {"source": "/admin/cadastros/eventos", "target": "/admin", "label": "Breadcrumb/Back"}
        ],
        "drifts": [
            {"path": "/events", "issue": "Link exist no Header mas rota não definida em AppRoutes.jsx"},
            {"path": "/admin/cadastros/fases", "issue": "Rota definida mas sem link direto na Sidebar/Home Cadastros"},
            {"component": "AdminLogin.jsx", "issue": "Duplicidade de componente em src/pages/AdminLogin.jsx e src/pages/admin/AdminLogin.jsx"}
        ]
    }
    return graph

if __name__ == "__main__":
    graph = generate_initial_graph()
    with open("ops/flow-mapper/output/system_flow.json", "w") as f:
        json.dump(graph, f, indent=2)
    
    state = {
        "last_execution": "2026-06-16",
        "version": "1.0.0",
        "status": "initialized",
        "analyzed_files": [
            "frontend/src/routes/AppRoutes.jsx",
            "frontend/src/layout/AppShell.jsx",
            "frontend/src/pages/admin/AdminLayout.jsx",
            "frontend/src/components/BottomNav.jsx",
            "frontend/src/components/Header.jsx"
        ]
    }
    with open("ops/flow-mapper/state/state.json", "w") as f:
        json.dump(state, f, indent=2)
