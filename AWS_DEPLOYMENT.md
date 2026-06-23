# 🚀 AWS Deployment Guide - Discord Bansos AI Monitor Bot

## 📊 Resource Requirements Summary

✅ **Memory**: ~100-180 MB (peak <200 MB)  
✅ **CPU**: <1% idle, ~5-10% saat scraping  
✅ **Network**: <100 KB/jam  
✅ **Disk**: ~20-30 MB total  

**Kesimpulan**: Bot ini SANGAT RINGAN! Cocok untuk instance terkecil AWS.

---

## 💰 Pilihan AWS & Biaya

| Service | Instance | RAM | CPU | Biaya/Bulan | Status |
|---------|----------|-----|-----|-------------|--------|
| **EC2** | t4g.nano | 512 MB | 2 vCPU | $3-4 | ✅ Cukup |
| **EC2** | t4g.micro | 1 GB | 2 vCPU | $6-7 | ⭐ Recommended |
| **Lightsail** | 512 MB | 512 MB | 1 vCPU | $3.50 | ✅ Termudah |
| **Lightsail** | 1 GB | 1 GB | 1 vCPU | $5 | ⭐ Best Value |

**Rekomendasi**: 
- **AWS Lightsail 1 GB** ($5/bulan) - Paling mudah setup, fixed price
- **EC2 t4g.micro** ($6-7/bulan) - Free tier eligible (first year FREE!)

---

## 🎯 Option 1: AWS Lightsail (TERMUDAH - Recommended untuk Pemula)

### Kelebihan:
- ✅ Setup paling mudah
- ✅ Harga fixed/predictable
- ✅ Include bandwidth (1-3 TB)
- ✅ Static IP gratis
- ✅ SSH langsung dari browser

### Step-by-Step:

#### 1. Buat Lightsail Instance

```bash
# Login ke AWS Console
# Pergi ke: https://lightsail.aws.amazon.com/

# Klik "Create instance"
# Pilih:
# - Platform: Linux/Unix
# - Blueprint: OS Only → Ubuntu 22.04 LTS
# - Instance plan: $5/month (1 GB RAM, 1 vCPU, 40 GB SSD)
# - Instance name: bansos-monitor-bot
# - Klik "Create instance"
```

#### 2. Connect via SSH

```bash
# Option A: SSH dari browser
# Klik "Connect using SSH" di Lightsail dashboard

# Option B: SSH dari terminal (recommended)
# Download SSH key dari Lightsail dashboard
# Simpan sebagai: ~/.ssh/lightsail-key.pem

chmod 400 ~/.ssh/lightsail-key.pem
ssh -i ~/.ssh/lightsail-key.pem ubuntu@YOUR_INSTANCE_IP
```

#### 3. Setup Server

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20.x (LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # Should show v20.x.x
npm --version   # Should show v10.x.x

# Install PM2 (process manager)
sudo npm install -g pm2

# Install git
sudo apt install -y git
```

#### 4. Deploy Bot

```bash
# Clone atau upload project
# Option A: Clone dari git
git clone YOUR_REPO_URL
cd discord-bansos-monitor-bot

# Option B: Upload via SCP (dari local machine)
# scp -i ~/.ssh/lightsail-key.pem -r discord-bansos-monitor-bot ubuntu@YOUR_IP:~/

# Install dependencies
npm install

# Edit .env
nano .env
# Isi dengan Discord token & channel ID
# Ctrl+X, Y, Enter untuk save

# Test bot
npm test

# Jika semua OK, jalankan dengan PM2
pm2 start src/index.js --name bansos-monitor
pm2 save
pm2 startup
# Copy-paste command yang muncul dan jalankan
```

#### 5. Setup Firewall (Optional - untuk keamanan)

```bash
# Lightsail sudah include firewall
# Cukup pastikan port 22 (SSH) open untuk IP Anda
# Tidak perlu buka port lain karena bot hanya outbound connection
```

#### 6. Monitor Bot

```bash
# Lihat logs
pm2 logs bansos-monitor

# Lihat status
pm2 status

# Restart bot
pm2 restart bansos-monitor

# Stop bot
pm2 stop bansos-monitor
```

---

## 🎯 Option 2: AWS EC2 (Lebih Fleksibel, Free Tier Available)

### Kelebihan:
- ✅ Free tier 12 bulan (t2.micro atau t3.micro)
- ✅ Lebih banyak pilihan instance type
- ✅ Bisa upgrade/downgrade kapan saja

### Step-by-Step:

#### 1. Launch EC2 Instance

```bash
# Login ke AWS Console
# Pergi ke: EC2 Dashboard → Launch Instance

# Configuration:
# - Name: bansos-monitor-bot
# - AMI: Ubuntu Server 22.04 LTS
# - Instance type: 
#   * t2.micro (free tier) - 1 GB RAM
#   * t4g.micro (ARM, lebih murah) - 1 GB RAM
# - Key pair: Create new atau pilih existing
# - Network settings:
#   * Create security group
#   * Allow SSH (port 22) from My IP
# - Storage: 8 GB gp3 (default sudah cukup)
# - Klik "Launch instance"
```

#### 2. Setup Security Group

```bash
# Di EC2 Dashboard → Security Groups
# Edit inbound rules:
# - Type: SSH
# - Protocol: TCP
# - Port: 22
# - Source: My IP (untuk keamanan)

# Tidak perlu buka port lain karena bot hanya outbound
```

#### 3. Connect via SSH

```bash
# Download .pem file saat create key pair
chmod 400 your-key.pem
ssh -i your-key.pem ubuntu@YOUR_EC2_PUBLIC_IP
```

#### 4. Setup Server (sama seperti Lightsail)

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install git
sudo apt install -y git
```

#### 5. Deploy Bot (sama seperti Lightsail)

```bash
# Clone project
git clone YOUR_REPO_URL
cd discord-bansos-monitor-bot

# Install dependencies
npm install

# Edit .env
nano .env

# Test & run
npm test
pm2 start src/index.js --name bansos-monitor
pm2 save
pm2 startup
```

---

## 🔒 Security Best Practices

### 1. Secure SSH

```bash
# Edit SSH config
sudo nano /etc/ssh/sshd_config

# Disable root login
PermitRootLogin no

# Disable password authentication (gunakan key saja)
PasswordAuthentication no

# Restart SSH
sudo systemctl restart sshd
```

### 2. Setup UFW Firewall (EC2 Only)

```bash
# Enable UFW
sudo ufw allow 22/tcp
sudo ufw enable

# Check status
sudo ufw status
```

### 3. Auto Security Updates

```bash
# Install unattended-upgrades
sudo apt install unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

### 4. Protect .env File

```bash
# Set proper permissions
chmod 600 .env
```

---

## 📊 Monitoring & Maintenance

### 1. Setup Monitoring Script

```bash
# Buat monitoring script
nano ~/check-bot.sh
```

Isi dengan:
```bash
#!/bin/bash
if ! pm2 status | grep -q "bansos-monitor.*online"; then
    echo "Bot down! Restarting..."
    pm2 restart bansos-monitor
    echo "Bot restarted at $(date)" >> ~/bot-restart.log
fi
```

```bash
chmod +x ~/check-bot.sh

# Add to crontab (check setiap 5 menit)
crontab -e
# Tambahkan:
*/5 * * * * ~/check-bot.sh
```

### 2. Log Rotation

```bash
# PM2 sudah auto rotate logs, tapi bisa dikustomisasi
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### 3. Disk Space Check

```bash
# Check disk usage
df -h

# Clean old logs
pm2 flush

# Clean npm cache jika perlu
npm cache clean --force
```

---

## 🔧 Useful Commands

### PM2 Management
```bash
pm2 start src/index.js --name bansos-monitor  # Start bot
pm2 stop bansos-monitor                        # Stop bot
pm2 restart bansos-monitor                     # Restart bot
pm2 delete bansos-monitor                      # Delete bot
pm2 logs bansos-monitor                        # View logs
pm2 logs bansos-monitor --lines 100            # View last 100 lines
pm2 monit                                      # Real-time monitoring
pm2 status                                     # Check status
pm2 save                                       # Save PM2 config
pm2 startup                                    # Auto-start on reboot
```

### System Management
```bash
free -h                    # Check memory usage
top                        # Check CPU/memory real-time
htop                       # Better top (need install: sudo apt install htop)
df -h                      # Check disk space
sudo systemctl status pm2-ubuntu  # Check PM2 service status
```

### Update Bot
```bash
cd ~/discord-bansos-monitor-bot
git pull                   # Update code
npm install                # Update dependencies
pm2 restart bansos-monitor # Restart bot
```

---

## 💡 Tips & Tricks

### 1. Share Server dengan App Lain

Bot ini sangat ringan (<200 MB), jadi bisa share server dengan aplikasi lain:

```bash
# Example: Running bot + web server di instance yang sama
# Bot: ~150 MB
# Nginx: ~10 MB
# Node.js web app: ~200-300 MB
# Total: ~350-450 MB → Masih muat di instance 1 GB!
```

### 2. Reduce Memory Usage (Jika Perlu)

Edit `src/index.js`, tambahkan di bagian atas:
```javascript
// Limit Node.js memory (optional)
process.env.NODE_OPTIONS = '--max-old-space-size=256';
```

### 3. Backup Data

```bash
# Backup posted.json secara berkala
# Add to crontab
crontab -e
# Tambahkan:
0 0 * * * cp ~/discord-bansos-monitor-bot/data/posted.json ~/backups/posted-$(date +\%Y\%m\%d).json
```

### 4. Email Alerts (Jika Bot Down)

Install sendmail atau gunakan AWS SNS untuk notifikasi jika bot down.

---

## 🎯 Cost Optimization

### 1. Reserved Instance (EC2)

Jika yakin pakai long-term:
- 1-year reserved: Save ~40%
- 3-year reserved: Save ~60%

### 2. Spot Instance (Advanced)

Bisa save hingga 90%, tapi bisa terminated kapan saja. Not recommended untuk production bot.

### 3. ARM Instance (t4g)

ARM instance (t4g) ~20% lebih murah dari x86 (t3):
- t3.micro: ~$7.5/bulan
- t4g.micro: ~$6/bulan
- Bot ini 100% compatible dengan ARM!

---

## 🚨 Troubleshooting

### Bot tidak bisa start
```bash
# Check logs
pm2 logs bansos-monitor

# Common issues:
# 1. .env tidak ada/salah
nano .env

# 2. Node version terlalu lama
node --version  # Should be v18+

# 3. Dependencies belum install
npm install
```

### Memory Usage Tinggi
```bash
# Check actual usage
pm2 monit

# Restart bot
pm2 restart bansos-monitor

# Clear cache
pm2 flush
```

### Bot stuck/not responding
```bash
# Force restart
pm2 delete bansos-monitor
pm2 start src/index.js --name bansos-monitor
pm2 save
```

---

## ✅ Checklist Deployment

- [ ] Instance sudah running (Lightsail atau EC2)
- [ ] SSH access working
- [ ] Node.js v18+ terinstall
- [ ] PM2 terinstall
- [ ] Bot code sudah di-upload
- [ ] `.env` sudah dikonfigurasi dengan benar
- [ ] `npm test` passed
- [ ] Bot berhasil start dengan PM2
- [ ] `pm2 save` dan `pm2 startup` sudah dijalankan
- [ ] Bot auto-start after reboot (test dengan `sudo reboot`)
- [ ] Monitoring script setup (optional)
- [ ] Backup script setup (optional)

---

## 📞 Next Steps

Setelah deploy:
1. Monitor logs selama 24 jam pertama
2. Test apakah bot kirim notifikasi saat ada konten baru
3. Verifikasi auto-restart after server reboot
4. Setup monitoring/alerting jika diperlukan

---

**Bot siap production di AWS! 🚀**
