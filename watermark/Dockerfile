FROM ghcr.io/astral-sh/uv:python3.12-bookworm

ENV UV_PROJECT_ENVIRONMENT=/app/.venv
ENV TORCH_HOME=/root/.cache/torch \
    YOLO_CONFIG_DIR=/root/.cache/ultralytics \
    HF_HOME=/root/.cache/huggingface

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        ffmpeg \
        libgl1 \
        libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

COPY pyproject.toml uv.lock ./

ARG TORCH_VERSION=2.8.0
ARG TORCHVISION_VERSION=0.23.0
ARG TORCH_CUDA_SUFFIX=""
ARG TORCH_CUDA_INDEX_URL=""

RUN uv sync --frozen --no-install-project || uv sync --no-install-project

RUN if [ -n "$TORCH_CUDA_SUFFIX" ]; then \
        uv pip install --no-cache-dir \
            --index-url "${TORCH_CUDA_INDEX_URL:-https://download.pytorch.org/whl/cu124}" \
            "torch==${TORCH_VERSION}${TORCH_CUDA_SUFFIX}" \
            "torchvision==${TORCHVISION_VERSION}${TORCH_CUDA_SUFFIX}"; \
    fi

COPY . .

RUN mkdir -p /app/resources "${TORCH_HOME}" "${YOLO_CONFIG_DIR}" "${HF_HOME}"

EXPOSE 8000

CMD ["uv", "run", "python", "start_server.py", "--host", "0.0.0.0", "--port", "8000"]

