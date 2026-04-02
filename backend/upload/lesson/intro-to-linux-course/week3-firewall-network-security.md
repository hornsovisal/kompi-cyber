# Week 3: Firewall Configuration & Network Security

## 🎯 Learning Outcomes

By the end of this week, you will:

- Configure UFW (Uncomplicated Firewall) for Linux
- Implement inbound/outbound traffic rules
- Set up stateful firewall policies
- Configure port forwarding securely
- Create rate limiting rules
- Monitor firewall logs

---

## 📚 Module Overview

| Aspect       | Details                                      |
| ------------ | -------------------------------------------- |
| **Duration** | 1 week                                       |
| **Firewall** | UFW (Ubuntu) / iptables (advanced)           |
| **Labs**     | 3 hands-on firewall configuration labs       |
| **Focus**    | Defense-in-depth, least privilege networking |

---

## Part 1: UFW Firewall Basics

### 🔥 Lab 1: Configure UFW (Uncomplicated Firewall)

**Objective:** Set up a secure firewall with minimal configuration.

**Task 1: Enable and Configure UFW**

```bash
# Install UFW (usually pre-installed)
sudo apt-get install -y ufw

# Enable UFW (WARNING: Will lock you out if not careful!)
# Set default policies FIRST
sudo ufw default deny incoming    # Block all incoming
sudo ufw default allow outgoing   # Allow all outgoing
sudo ufw default deny routed      # Don't route traffic

# THEN enable firewall
sudo ufw enable
# Command may disrupt existing ssh session...

# Check status
sudo ufw status verbose
# Status: active
# Logging: on (level: low)
# Default: deny (incoming), allow (outgoing), deny (routed)
# New profiles: skip
```

**Task 2: Allow Essential Services (SSH First!)**

```bash
# CRITICAL: Allow SSH so you don't lock yourself out!
sudo ufw allow 22/tcp       # Standard SSH port
sudo ufw allow 2222/tcp     # If you changed SSH port to 2222

# View new rules
sudo ufw status numbered
# [ 1] 22/tcp                     ALLOW IN  Anywhere
# [ 2] 2222/tcp                   ALLOW IN  Anywhere

# Test SSH connection (keep terminal open!)
ssh -p 2222 alice@localhost
# If connected ✅ Good, continue
# If NOT connected ❌ Fix before disabling firewall!
```

**Task 3: Allow Web Services**

```bash
# HTTP traffic
sudo ufw allow 80/tcp

# HTTPS traffic
sudo ufw allow 443/tcp

# Combined HTTP/HTTPS (short syntax)
sudo ufw allow 'Apache Full'     # Includes 80 and 443
sudo ufw allow 'Nginx Full'      # Includes 80 and 443

# Allow only HTTPS (more secure)
sudo ufw allow 443/tcp
sudo ufw deny 80/tcp             # Force HTTPS

# View all rules
sudo ufw status verbose
```

**Task 4: Restrict Source IP**

```bash
# Allow SSH only from trusted network
sudo ufw allow from 192.168.1.0/24 to any port 22

# Explanation:
# from 192.168.1.0/24 = only IPs 192.168.1.0 to 192.168.1.255
# to any = to this server
# port 22 = SSH port

# Deny SSH from everywhere else
sudo ufw deny 22/tcp

# View rules
sudo ufw status
# Rule                       Action  From
# --                         ------  ----
# 22/tcp                     ALLOW IN  192.168.1.0/24
# 22/tcp                     DENY IN   Anywhere

# Delete a rule (if needed)
sudo ufw delete allow 80/tcp      # Removes HTTP
# or
sudo ufw delete 1                 # Deletes rule #1
```

---

## Part 2: Advanced Firewall Rules

### 🔥 Lab 2: Rate Limiting & Advanced Rules

**Objective:** Prevent attacks like brute force and DoS.

**Task 1: Enable Rate Limiting**

```bash
# Rate limit SSH (prevent brute force)
sudo ufw limit 22/tcp

# Explanation:
# limit = max 6 connections per 30 seconds from same IP
# After limit: Drop traffic from that IP for 30 more seconds

# Test rate limiting
ssh alice@localhost     # Connection 1 ✅
ssh alice@localhost     # Connection 2 ✅
ssh alice@localhost     # Connection 3 ✅
ssh alice@localhost     # Connection 4 ✅
ssh alice@localhost     # Connection 5 ✅
ssh alice@localhost     # Connection 6 ✅
ssh alice@localhost     # Connection 7 ❌ Rate limited!
# Connection refused (IP temp blocked)

# Rate limit HTTP (prevent scanning/DoS)
sudo ufw limit 80/tcp
sudo ufw limit 443/tcp
```

**Task 2: Allow Specific Port Ranges**

```bash
# Allow VPN ports (1194 is OpenVPN standard)
sudo ufw allow 1194/udp

# Allow DNS (recursive nameserver query)
sudo ufw allow 53/udp

# Allow NTP (time synchronization)
sudo ufw allow 123/udp

# Allow custom port range (e.g., media streaming)
sudo ufw allow 5000:5100/tcp

# Verify
sudo ufw status numbered
# [ 1] 22/tcp                     LIMIT IN  Anywhere
# [ 2] 80/tcp                     LIMIT IN  Anywhere
# [ 3] 443/tcp                    LIMIT IN  Anywhere
# [ 4] 1194/udp                   ALLOW IN  Anywhere
# [ 5] 53/udp                     ALLOW IN  Anywhere
# [ 6] 123/udp                    ALLOW IN  Anywhere
# [ 7] 5000:5100/tcp              ALLOW IN  Anywhere
```

**Task 3: Deny Specific IPs (Blacklist)**

```bash
# Block a known attacker IP
sudo ufw deny from 203.0.113.45

# Block entire malicious network
sudo ufw deny from 198.51.100.0/24

# View blocks
sudo ufw status verbose
# 203.0.113.45          DENY IN  Anywhere
# 198.51.100.0/24       DENY IN  Anywhere

# Later, unblock if needed
sudo ufw delete deny from 203.0.113.45
```

---

## Part 3: Firewall Monitoring & Logging

### 🔥 Lab 3: Monitor Firewall Activity

**Task 1: Enable Detailed Logging**

```bash
# Currently: low logging
# Enable detailed logging
sudo ufw logging on
sudo ufw logging full        # Most detailed (packets logged)

# Change logging level
sudo ufw logging medium      # Balanced logging

# View current setting
sudo ufw status verbose
# Logging: on (level: medium)
```

**Task 2: View Firewall Logs**

```bash
# Firewall logs go to kernel logs
sudo tail -f /var/log/kern.log | grep UFW

# Output shows:
# [UFW BLOCK] IN=eth0 OUT= MAC=... SRC=203.0.113.45 DST=192.168.1.100 PROTO=TCP SPT=54321 DPT=22

# Decode the log:
# [UFW BLOCK] ➜ Firewall rule matched (blocked)
# IN=eth0 ➜ Packet arrived on eth0 interface
# SRC=203.0.113.45 ➜ Source IP (attacker)
# DST=192.168.1.100 ➜ Destination (your server)
# PROTO=TCP ➜ Protocol (TCP)
# SPT=54321 ➜ Source port (random)
# DPT=22 ➜ Destination port (SSH)

# See ALL blocked traffic
sudo grep UFW /var/log/kern.log | grep BLOCK | tail -20

# See blocked SSH attempts
sudo grep UFW /var/log/kern.log | grep BLOCK | grep DPT=22

# Count blocked packets by source IP
sudo grep UFW /var/log/kern.log | grep BLOCK | \
  awk '{print $NF}' | cut -d= -f2 | sort | uniq -c | sort -rn
```

**Task 3: Detect Potential Attacks**

```bash
# Look for brute force attempts (many connections to port 22)
sudo grep UFW /var/log/kern.log | grep BLOCK | grep DPT=22 | \
  awk '{print $NF}' | cut -d= -f2 | sort | uniq -c | sort -rn

# Output shows attacker IPs with connection counts:
# 145 203.0.113.45    <- Many blocked connections = brute force!
# 89 198.51.100.200
# 23 192.168.100.50

# Look for port scanning (connections to random ports)
sudo grep UFW /var/log/kern.log | grep BLOCK | \
  awk -F'DPT=' '{print $2}' | sort | uniq -c | sort -rn | head -10

# Output:
# 234 22 PROTO=TCP <- Many attempts to SSH (brute force)
# 178 80 PROTO=TCP <- Trying HTTP
# 145 443 PROTO=TCP <- Trying HTTPS
# 98 3306 PROTO=TCP <- Trying MySQL (wrong port!)
# 87 5432 PROTO=TCP <- Trying PostgreSQL

# This is a port scan - attacker is testing all ports!
```

**Task 4: Create Alert Script**

```bash
# Create script to alert on failed SSH attempts
cat > /usr/local/bin/firewall-monitor.sh << 'EOF'
#!/bin/bash

echo "=== FIREWALL THREAT SUMMARY ==="
echo

echo "[FAILED SSH ATTEMPTS]"
sudo grep UFW /var/log/kern.log | grep BLOCK | grep DPT=22 | \
  awk '{print $NF}' | cut -d= -f2 | sort | uniq -c | sort -rn | head -5

echo
echo "[PORT SCAN ATTEMPTS]"
sudo grep UFW /var/log/kern.log | grep BLOCK | wc -l
echo "total blocked packets"

echo
echo "[BLOCKED NETWORKS]"
sudo grep UFW /var/log/kern.log | grep BLOCK | \
  awk '{print $NF}' | cut -d= -f2 | sort | uniq | head -5
EOF

chmod +x /usr/local/bin/firewall-monitor.sh

# Run monitoring
./firewall-monitor.sh

# Schedule daily report
sudo crontab -e
# Add: 0 9 * * * /usr/local/bin/firewall-monitor.sh | mail -s "Daily Firewall Report" admin@example.com
```

---

## 📊 Common Firewall Rules Reference

```bash
# WEB SERVERS
sudo ufw allow 80/tcp       # HTTP
sudo ufw allow 443/tcp      # HTTPS
sudo ufw allow 'Apache Full'  # Both

# SSH / REMOTE ACCESS
sudo ufw allow 22/tcp             # SSH (default)
sudo ufw allow 2222/tcp           # SSH (custom port)
sudo ufw limit 22/tcp             # SSH with rate limit
sudo ufw allow from 192.168.1.0/24 to any port 22

# DATABASES
sudo ufw allow from 192.168.1.100 to any port 3306  # MySQL from app server
sudo ufw allow from 192.168.1.100 to any port 5432  # PostgreSQL from app server
# NEVER expose DB to internet!

# EMAIL
sudo ufw allow 25/tcp       # SMTP (send)
sudo ufw allow 110/tcp      # POP3 (receive)
sudo ufw allow 143/tcp      # IMAP (receive)

# DNS
sudo ufw allow 53/udp       # DNS queries

# VPN
sudo ufw allow 1194/udp     # OpenVPN
sudo ufw allow 1194/tcp     # OpenVPN alternative

# BLOCK ALL ELSE (default policy already does this)
sudo ufw default deny incoming
```

---

## ✅ Completion Checklist

- [ ] Installed and enabled UFW firewall
- [ ] Set default deny incoming / allow outgoing policies
- [ ] Allowed SSH before enabling firewall (critical!)
- [ ] Created rules for HTTP/HTTPS traffic
- [ ] Implemented rate limiting on SSH
- [ ] Configured source IP restrictions
- [ ] Created blocklist for known attackers
- [ ] Enabled detailed firewall logging
- [ ] Analyzed firewall logs for attacks
- [ ] Created firewall monitoring script
- [ ] Tested all rules with actual traffic

**Next Week:** System monitoring, audit logging, and intrusion detection.
