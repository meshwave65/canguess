import os
import re
import json

def extract_imports(file_path):
    imports = []
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            # Regex simples para capturar imports relativos
            matches = re.findall(r'import .* from ["\'](.*)["\']', content)
            for m in matches:
                if m.startswith('.'):
                    imports.append(m)
    except:
        pass
    return imports

def map_dependencies(base_path):
    dep_map = {}
    for root, dirs, files in os.walk(base_path):
        for file in files:
            if file.endswith(('.jsx', '.js')):
                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, base_path)
                dep_map[rel_path] = extract_imports(full_path)
    return dep_map

if __name__ == "__main__":
    frontend_path = "frontend/src"
    dependencies = map_dependencies(frontend_path)
    os.makedirs("ops/flow-mapper/output", exist_ok=True)
    with open("ops/flow-mapper/output/system_dependencies.json", "w") as f:
        json.dump(dependencies, f, indent=2)
