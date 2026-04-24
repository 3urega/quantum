# Misma imagen lógica que `infrastructure/docker/Dockerfile.quantum-api` pero
# **contexto de build = apps/quantum-api** (Root directory = apps/quantum-api en Railway).
# COPY relativos: no hay ruta `apps/quantum-api/...` en el contexto.
FROM python:3.11-slim-bookworm

WORKDIR /app

COPY requirements.txt /tmp/requirements.txt
RUN pip install --no-cache-dir -r /tmp/requirements.txt

COPY app ./app
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

ENV PYTHONPATH=/app
ENV PORT=8000
EXPOSE 8000

ENTRYPOINT ["/docker-entrypoint.sh"]
