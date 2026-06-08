from supabase import create_client
from dataset.worldcup_2026 import WORLD_CUP

import os

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_KEY")

supabase = create_client(url, key)

country_map = {}
country_name_map = {}
region_map = {}
city_map = {}

print("🚀 Inserindo países...")

for c in WORLD_CUP["countries"]:

    res = (
        supabase
        .table("countries")
        .upsert(
            {
                "code": c["code"],
                "country": c["country"],
                "capital": c["capital"]
            },
            on_conflict="code"
        )
        .execute()
    )

    country_id = res.data[0]["id"]

    country_map[c["code"]] = country_id
    country_name_map[c["code"]] = c["country"]

print("🚀 Inserindo regiões...")

for c in WORLD_CUP["countries"]:

    res = (
        supabase
        .table("regions")
        .upsert(
            {
                "country_id": country_map[c["code"]],
                "code": "CP",
                "region": "Capital"
            }
        )
        .execute()
    )

    region_map[c["code"]] = res.data[0]["id"]

print("🚀 Inserindo cidades...")

for c in WORLD_CUP["countries"]:

    res = (
        supabase
        .table("cities")
        .upsert(
            {
                "country_id": country_map[c["code"]],
                "region_id": region_map[c["code"]],
                "city": c["capital"]
            }
        )
        .execute()
    )

    city_map[c["code"]] = res.data[0]["id"]

print("🚀 Inserindo seleções...")

for c in WORLD_CUP["countries"]:

    supabase.table("times").upsert(
        {
            "nome": f'Seleção {c["country"]}',
            "codigo": c["code"],

            "pais_id": country_map[c["code"]],
            "regiao_id": region_map[c["code"]],
            "cidade_id": city_map[c["code"]],

            "divisao": "WC2026"
        },
        on_conflict="codigo"
    ).execute()

print("🎉 Seed concluído com sucesso")
