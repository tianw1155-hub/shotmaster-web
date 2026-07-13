#!/usr/bin/expect -f
set timeout 600

set SERVER_IP "43.167.205.61"
set USERNAME "ubuntu"
set PASSWORD "Go15561245367~"
set APP_DIR "/opt/shotmaster"

puts "========================================="
puts "  ShotMaster 腾讯云部署"
puts "  服务器: $SERVER_IP"
puts "========================================="

puts "\n[1/7] 连接服务器..."
spawn ssh -o StrictHostKeyChecking=no $USERNAME@$SERVER_IP
expect {
    "password:" {
        send "$PASSWORD\r"
    }
    "Permission denied" {
        puts "\n密码错误，无法连接服务器"
        exit 1
    }
    timeout {
        puts "\n连接超时"
        exit 1
    }
}
expect "$ "

puts "\n[2/7] 安装 Docker..."
send "curl -fsSL https://get.docker.com | sudo -S sh\r"
expect {
    "password" {
        send "$PASSWORD\r"
        exp_continue
    }
    "$ " {
        puts "Docker 安装完成"
    }
}

puts "\n[3/7] 启动 Docker 服务..."
send "sudo systemctl enable docker && sudo systemctl start docker\r"
expect "$ "

puts "\n[4/7] 创建应用目录..."
send "sudo mkdir -p $APP_DIR && sudo chown ubuntu:ubuntu $APP_DIR\r"
expect "$ "

puts "\n部署文件准备完成，接下来上传代码..."
puts "（请手动执行 scp 上传代码，或使用 git clone）"

interact