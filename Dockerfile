# ShotMaster 后端服务 Docker 镜像
# 适用于 Render / Railway / Fly.io 等支持 Dockerfile 的 PaaS 平台

FROM golang:1.25-alpine AS builder

WORKDIR /app

# 先复制 go mod 文件，利用 Docker 缓存层
COPY backend/go.mod backend/go.sum ./
RUN go mod download

# 再复制后端源码
COPY backend/ ./

# 静态编译 Linux 可执行文件
RUN CGO_ENABLED=0 GOOS=linux go build -o shotmaster-backend .

FROM alpine:latest

RUN apk --no-cache add ca-certificates

WORKDIR /app

COPY --from=builder /app/shotmaster-backend .

# PaaS 平台通常通过 PORT 环境变量注入端口；这里仅做声明，程序会读取 PORT。
EXPOSE 8080

CMD ["./shotmaster-backend"]
