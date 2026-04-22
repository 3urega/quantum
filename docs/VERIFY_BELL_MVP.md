# Verificación manual — lab Bell / GHZ (API)

Objetivo: comprobar en local que el motor y los endpoints de **lab** y **compare** responden **después de alinear el proceso** con el código del repo (si el servidor llevaba mucho tiempo sin reiniciar, `GET /openapi.json` puede no listar aún `\/runs\/compare`).

## Prerrequisitos

1. PostgreSQL accesible (`QUANTUM_API_DATABASE_URL`).
2. API: `npm run dev:api` desde la raíz del monorepo (o `uvicorn` equivalente) **tras** un `git pull` que incluya las rutas `/runs/lab` y `/runs/compare`.
3. Comprobar salud: `curl -sS http://127.0.0.1:8000/health`

## Comprobar OpenAPI

```bash
curl -sS http://127.0.0.1:8000/openapi.json | grep -E 'compare|/lab' || true
```

Deberías ver referencias a esos paths. Si no, reinicia el proceso de la API.

## Flujo mínimo (bash)

1. Crear un run Bell y ejecutarlo (sustituye el JSON si tu versión de la API requiere otro cuerpo):

```bash
API=http://127.0.0.1:8000
R1=$(curl -sS -X POST "$API/runs" -H 'Content-Type: application/json' \
  -d '{"template_id":"bell-state","backend":"local_simulator","shots":256,"parameters":{}}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
curl -sS -X POST "$API/runs/$R1/execute" -o /dev/null
```

2. Repetir para un **segundo** run (`R2`), ejecutar.
3. `GET /runs/lab?template_id=bell-state&limit=5` — debe listar al menos esos runs con `result`.
4. `POST /runs/compare` con `run_id_a` y `run_id_b` (los dos UUID) — debe devolver `aligned.labels` y conteos.

Si `POST /compare` responde **405 Method Not Allowed**, el binario o el proceso en el puerto 8000 **no** corresponde al código actual: reinicia la API o libera el puerto.

## Flujo mínimo GHZ (Fase F)

Misma API que Bell: `template_id=ghz-state` y `parameters.num_qubits` (p. ej. 3). Tras **dos** runs ejecutados:

1. `GET /runs/lab?template_id=ghz-state&limit=5` — entradas con `result` e histograma.
2. `POST /runs/compare` con los dos `id` de run — `aligned` une etiquetas (p. ej. `000`/`111` para n=3) aunque los conteos difieran.

Ejemplo de creación (mismo esquema que Bell, añadiendo `parameters`):

```bash
R1=$(curl -sS -X POST "$API/runs" -H 'Content-Type: application/json' \
  -d '{"template_id":"ghz-state","backend":"local_simulator","shots":256,"parameters":{"num_qubits":3}}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
curl -sS -X POST "$API/runs/$R1/execute" -o /dev/null
```

Repite para `R2` y luego `POST /runs/compare` con `R1` y `R2`. La UI en **`/experiments/ghz-state`** reutiliza historial y compare como el lab de Bell.
