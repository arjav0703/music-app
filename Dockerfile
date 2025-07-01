## WARNING, DO NOT USE THIS. IT IS BROKEN.


FROM node:18-alpine AS frontend-build

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build  


FROM rust:1.72-slim AS tauri-build

RUN apt-get update \
 && DEBIAN_FRONTEND=noninteractive apt-get install -y \
      build-essential \
      libwebkit2gtk-4.0-dev \
      pkg-config \

WORKDIR /app

COPY Cargo.toml Cargo.lock ./
COPY src-tauri/ ./src-tauri/
COPY tauri.conf.json ./

COPY --from=frontend-build /out ./dist

WORKDIR /app/src-tauri

RUN cargo build --release


FROM debian:bookworm-slim AS runtime

RUN apt-get update \
 && DEBIAN_FRONTEND=noninteractive apt-get install -y \
      libgtk-3-0 \
      libwebkit2gtk-4.0-37 \
      libappindicator3-dev \
      librsvg2-dev \
      patchelf

WORKDIR /app

COPY --from=tauri-build /app/src-tauri/target/release/ ./

