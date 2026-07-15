#!/bin/bash
# ShotMaster 一键启动脚本
# 用法: ./start_all.sh

set -e

echo "=========================================="
echo "  ShotMaster 一键启动脚本"
echo "=========================================="

# 1. 检查并启动 PostgreSQL
echo ""
echo "[1/5] 检查 PostgreSQL..."
if ! command -v pg_ctlcluster &> /dev/null; then
    echo "  安装 PostgreSQL..."
    apt-get update -qq && apt-get install -y -qq postgresql postgresql-client > /dev/null 2>&1
fi
if ! pg_ctlcluster 16 main status &> /dev/null; then
    echo "  启动 PostgreSQL..."
    pg_ctlcluster 16 main start 2>/dev/null || true
    sleep 2
fi
echo "  ✅ PostgreSQL 运行中"

# 2. 恢复数据库（如不存在）
echo ""
echo "[2/5] 检查数据库..."
su - postgres -c "psql -c \"ALTER USER postgres PASSWORD 'postgres';\"" > /dev/null 2>&1 || true
if ! PGPASSWORD=postgres psql -h localhost -U postgres -lqt 2>/dev/null | grep -q "shotmaster"; then
    echo "  创建数据库并恢复数据..."
    su - postgres -c "createdb shotmaster" 2>/dev/null || true
    if [ -f /workspace/backend/shotmaster_backup.sql ]; then
        PGPASSWORD=postgres psql -h localhost -U postgres -d shotmaster -f /workspace/backend/shotmaster_backup.sql > /dev/null 2>&1
        echo "  ✅ 数据已恢复"
    else
        echo "  ⚠️ 备份文件不存在，跳过恢复"
    fi
else
    # 检查数据是否完整
    COUNT=$(PGPASSWORD=postgres psql -h localhost -U postgres -d shotmaster -tA -c "SELECT count(*) FROM eval_images;" 2>/dev/null || echo "0")
    if [ "$COUNT" -lt "30" ]; then
        echo "  数据不完整($COUNT条)，重新恢复..."
        if [ -f /workspace/backend/shotmaster_backup.sql ]; then
            PGPASSWORD=postgres psql -h localhost -U postgres -d shotmaster -f /workspace/backend/shotmaster_backup.sql > /dev/null 2>&1
            echo "  ✅ 数据已恢复"
        fi
    else
        echo "  ✅ 数据库已存在 ($COUNT 条图片)"
    fi
fi

# 3. 杀掉旧进程
echo ""
echo "[3/5] 清理旧进程..."
pkill -f "shotmaster-backend" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true
sleep 1
echo "  ✅ 已清理"

# 4. 启动后端
echo ""
echo "[4/5] 启动后端服务..."
cd /workspace/backend
if [ ! -f shotmaster-backend ]; then
    echo "  编译后端..."
    go build -o shotmaster-backend . 2>&1 | tail -3
fi
nohup ./shotmaster-backend > /tmp/backend.log 2>&1 &
sleep 2
if curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/api/health | grep -q "200"; then
    echo "  ✅ 后端运行中 (端口 8080)"
else
    echo "  ❌ 后端启动失败，查看日志: /tmp/backend.log"
    cat /tmp/backend.log | tail -10
    exit 1
fi

# 5. 启动前端
echo ""
echo "[5/5] 启动前端服务..."
cd /workspace
if [ ! -d node_modules ]; then
    echo "  安装依赖..."
    npm install > /dev/null 2>&1
fi
nohup npm run dev > /tmp/frontend.log 2>&1 &
sleep 3
if curl -s -o /dev/null -w "%{http_code}" http://localhost:5173/ | grep -q "200"; then
    echo "  ✅ 前端运行中 (端口 5173)"
else
    echo "  ❌ 前端启动失败，查看日志: /tmp/frontend.log"
    cat /tmp/frontend.log | tail -10
    exit 1
fi

# 完成
echo ""
echo "=========================================="
echo "  🎉 全部启动完成!"
echo "=========================================="
echo ""
echo "  管理后台: http://localhost:5173/admin/login"
echo "  账号: admin / admin123"
echo ""
echo "  后端日志: tail -f /tmp/backend.log"
echo "  前端日志: tail -f /tmp/frontend.log"
echo ""
