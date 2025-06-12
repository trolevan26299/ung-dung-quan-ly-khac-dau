# 🚀 Deployment Guide - Khắc Dấu TT

## Tổng quan

Hệ thống CI/CD tự động sử dụng GitHub Actions để deploy ứng dụng lên VPS khi push code lên nhánh `production`.

## Kiến trúc Deployment

```
GitHub Repository (production branch)
      ↓ (on push)
GitHub Actions CI/CD
      ↓ (build & push)
GitHub Container Registry (GHCR)
      ↓ (deploy)
VPS Server (Docker Compose)
```

## 🔧 Setup Lần Đầu

### 1. Chuẩn bị VPS (Setup thủ công)

```bash
# SSH vào VPS của bạn
ssh user@your-vps-ip

# Cập nhật hệ thống
sudo apt update && sudo apt upgrade -y

# Cài đặt Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
sudo usermod -aG docker $USER
rm get-docker.sh

# Cài đặt Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Cài đặt Git
sudo apt install -y git

# Tạo thư mục project
sudo mkdir -p /opt/khac-dau-tt
sudo chown $USER:$USER /opt/khac-dau-tt
cd /opt/khac-dau-tt

# Clone repository
git clone https://github.com/YOUR_USERNAME/ung-dung-quan-ly-khac-dau.git .
git checkout production

# Copy và chỉnh sửa file environment
cp .env.production .env
nano .env

# Cấu hình firewall
sudo ufw allow ssh
sudo ufw allow 3002  # Frontend port
sudo ufw allow 8081  # Backend port
sudo ufw allow 27017 # MongoDB port
sudo ufw --force enable
```

### 2. Cấu hình GitHub Secrets

Truy cập: `Settings > Secrets and variables > Actions` và thêm:

```bash
# VPS Connection
VPS_HOST=your-vps-ip-address
VPS_USERNAME=your-vps-username  
VPS_SSH_KEY=your-private-ssh-key
VPS_PORT=22
VPS_PROJECT_PATH=/opt/khac-dau-tt

# Database
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=your-secure-mongodb-password
MONGO_DATABASE=khac_dau_tt_prod

# Security
JWT_SECRET=your-super-secure-jwt-secret-32-chars-min
JWT_EXPIRES_IN=7d

# Frontend
REACT_APP_API_URL=http://your-vps-ip:8081/api

# Optional: Notifications
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/your/slack/webhook
```

### 3. Tạo SSH Key cho GitHub Actions

```bash
# Trên VPS
ssh-keygen -t rsa -b 4096 -C "github-actions"

# Hiển thị public key để thêm vào authorized_keys
cat ~/.ssh/id_rsa.pub >> ~/.ssh/authorized_keys

# Hiển thị private key để copy vào GitHub Secrets (VPS_SSH_KEY)
cat ~/.ssh/id_rsa
```

## 🏗️ Quy trình Deployment

### Backend Deployment

**Trigger**: Push vào `Backend/` hoặc workflow files trên nhánh `production`

**Quy trình**:
1. ✅ Checkout code
2. 🐳 Build Docker image cho backend
3. 📦 Push image lên GitHub Container Registry
4. 🚀 SSH vào VPS và deploy
5. ✅ Health check và thông báo

### Frontend Deployment  

**Trigger**: Push vào `frontend/` hoặc workflow files trên nhánh `production`

**Quy trình**:
1. ✅ Checkout code  
2. 🐳 Build Docker image cho frontend với nginx
3. 📦 Push image lên GitHub Container Registry
4. 🚀 SSH vào VPS và deploy
5. ✅ Health check và thông báo

## 📂 Cấu trúc Files

```
├── .github/workflows/
│   ├── backend-deploy.yml      # CI/CD cho backend
│   └── frontend-deploy.yml     # CI/CD cho frontend
├── Backend/
│   └── Dockerfile              # Docker config cho backend
├── frontend/
│   └── Dockerfile              # Docker config cho frontend  
├── docker-compose.prod.yml     # Production compose
└── .env.production             # Environment template
```

## 🚀 Cách Deploy

### Deploy Backend

```bash
# Commit changes vào Backend
git add Backend/
git commit -m "Update backend features"

# Push lên production branch  
git push origin production
```

### Deploy Frontend

```bash
# Commit changes vào frontend
git add frontend/
git commit -m "Update frontend UI"

# Push lên production branch
git push origin production  
```

### Deploy Cả Hai

```bash
# Commit tất cả changes
git add .
git commit -m "Full stack update"

# Push lên production branch
git push origin production
```

## 🔍 Monitoring & Logs

### Kiểm tra trạng thái services

```bash
# SSH vào VPS
ssh user@your-vps-ip

# Kiểm tra containers
docker-compose -f docker-compose.prod.yml ps

# Xem logs
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f frontend
docker-compose -f docker-compose.prod.yml logs -f mongodb
```

### Health Checks

- **Backend**: `http://your-vps-ip:8081/health`
- **Frontend**: `http://your-vps-ip:3002/`
- **Database**: Internal health check

## 🛠️ Troubleshooting

### Container không start

```bash
# Restart services
docker-compose -f docker-compose.prod.yml restart

# Rebuild và restart
docker-compose -f docker-compose.prod.yml up -d --force-recreate
```

### GitHub Actions fail

1. Kiểm tra GitHub Secrets
2. Verify SSH key permissions
3. Check VPS disk space: `df -h`
4. Review workflow logs

### Database issues

```bash
# Connect to MongoDB
docker exec -it khac-dau-tt-mongodb mongosh -u admin -p

# Check database
use khac_dau_tt_prod
show collections
```

## 🔒 Security Notes

- ✅ Containers chạy với non-root user
- ✅ Firewall configured (UFW)
- ✅ Environment variables encrypted
- ✅ SSH key authentication
- ✅ Health checks enabled

## 📈 Performance Optimization

- Multi-stage Docker builds
- Docker layer caching
- Image compression
- Resource limits

## 🆘 Support

- **GitHub Issues**: Report bugs và features
- **Logs**: `/opt/khac-dau-tt/logs/`
- **Monitoring**: Docker stats và health checks

---

**🎉 Happy Deploying!** 🚀 