#!/bin/bash
set -e

echo "========================================="
echo "  ShotMaster 腾讯云部署脚本"
echo "========================================="

APP_NAME="shotmaster"
APP_DIR="/opt/${APP_NAME}"

echo ""
echo "[1/6] 检查 Docker..."
if ! command -v docker &> /dev/null; then
    echo "安装 Docker..."
    curl -fsSL https://get.docker.com | sh
    systemctl enable docker
    systemctl start docker
fi
echo "Docker 版本: $(docker --version)"

echo ""
echo "[2/6] 检查 Docker Compose..."
if ! docker compose version &> /dev/null; then
    echo "Docker Compose 不可用，请先安装 Docker Compose 插件"
    exit 1
fi
echo "Docker Compose 版本: $(docker compose version)"

echo ""
echo "[3/6] 创建应用目录 ${APP_DIR}..."
mkdir -p ${APP_DIR}

echo ""
echo "[4/6] 复制部署文件..."
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

if [ -f "${SCRIPT_DIR}/docker-compose.yml" ]; then
    cp ${SCRIPT_DIR}/docker-compose.yml ${APP_DIR}/
fi

if [ -f "${SCRIPT_DIR}/.env.production" ]; then
    cp ${SCRIPT_DIR}/.env.production ${APP_DIR}/.env
elif [ -f "${SCRIPT_DIR}/.env" ]; then
    cp ${SCRIPT_DIR}/.env ${APP_DIR}/.env
fi

mkdir -p ${APP_DIR}/backend
if [ -f "${SCRIPT_DIR}/backend/Dockerfile" ]; then
    cp ${SCRIPT_DIR}/backend/Dockerfile ${APP_DIR}/backend/
fi
cp -r ${SCRIPT_DIR}/backend/* ${APP_DIR}/backend/ 2>/dev/null || true

if [ -f "${SCRIPT_DIR}/Dockerfile" ]; then
    cp ${SCRIPT_DIR}/Dockerfile ${APP_DIR}/
fi
if [ -f "${SCRIPT_DIR}/nginx.conf" ]; then
    cp ${SCRIPT_DIR}/nginx.conf ${APP_DIR}/
fi

if [ -d "${SCRIPT_DIR}/src" ]; then
    mkdir -p ${APP_DIR}/src
    cp -r ${SCRIPT_DIR}/src ${APP_DIR}/
fi
if [ -d "${SCRIPT_DIR}/public" ]; then
    mkdir -p ${APP_DIR}/public
    cp -r ${SCRIPT_DIR}/public ${APP_DIR}/
fi
if [ -f "${SCRIPT_DIR}/package.json" ]; then
    cp ${SCRIPT_DIR}/package.json ${APP_DIR}/
fi
if [ -f "${SCRIPT_DIR}/package-lock.json" ]; then
    cp ${SCRIPT_DIR}/package-lock.json ${APP_DIR}/
fi
if [ -f "${SCRIPT_DIR}/vite.config.ts" ]; then
    cp ${SCRIPT_DIR}/vite.config.ts ${APP_DIR}/
fi
if [ -f "${SCRIPT_DIR}/tsconfig.json" ]; then
    cp ${SCRIPT_DIR}/tsconfig.json ${APP_DIR}/
fi
if [ -f "${SCRIPT_DIR}/tailwind.config.js" ]; then
    cp ${SCRIPT_DIR}/tailwind.config.js ${APP_DIR}/
fi
if [ -f "${SCRIPT_DIR}/postcss.config.js" ]; then
    cp ${SCRIPT_DIR}/postcss.config.js ${APP_DIR}/
fi
if [ -f "${SCRIPT_DIR}/index.html" ]; then
    cp ${SCRIPT_DIR}/index.html ${APP_DIR}/
fi

echo ""
echo "[5/6] 启动服务..."
cd ${APP_DIR}
docker compose down 2>/dev/null || true
docker compose up -d --build

echo ""
echo "[6/6] 等待服务启动..."
sleep 10

echo ""
echo "========================================="
echo "  部署完成！"
echo "========================================="
echo ""
echo "访问地址："
echo "  前台: http://$(curl -s ifconfig.me 2>/dev/null || echo '服务器IP')"
echo "  后台: http://$(curl -s ifconfig.me 2>/dev/null || echo '服务器IP')/admin/login"
echo ""
echo "默认管理员账号：admin / admin123"
echo ""
echo "常用命令："
echo "  查看日志: docker compose -f ${APP_DIR}/docker-compose.yml logs -f"
echo "  重启服务: docker compose -f ${APP_DIR}/docker-compose.yml restart"
echo "  停止服务: docker compose -f ${APP_DIR}/docker-compose.yml down"
echo ""