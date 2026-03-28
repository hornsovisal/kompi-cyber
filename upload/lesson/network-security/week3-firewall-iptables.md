# Week 3: Firewall Hardening & IPTables

## 🎯 Learning Outcomes

By the end of this week, you will:

- Understand iptables and netfilter architecture
- Create stateful firewall rules
- Implement network address translation (NAT)
- Configure port forwarding securely
- Build multi-layer firewall policies
- Monitor firewall performance

---

## 📚 Module Overview

| Aspect       | Details                                    |
| ------------ | ------------------------------------------ |
| **Duration** | 1 week                                     |
| **Tool**     | iptables, netfilter, iptables-persistent   |
| **Labs**     | 3 hands-on firewall configuration labs     |
| **Focus**    | Stateful filtering, NAT, security policies |

---

## Part 1: IPTables Fundamentals

### 🔥 Lab 1: Build Stateful Firewall Rules

**Task 1: Understanding IPTables Chains**

```bash
# View current iptables rules
sudo iptables -L -n -v
# Lists all rules with packet counts

# Chains:
# INPUT = packets destined for this machine
# OUTPUT = packets originating from this machine
# FORWARD = packets routing through this machine

# Actions:
# ACCEPT = allow packet
# DROP = discard silently
# REJECT = discard and send error
# LOG = record before continuing
```

**Task 2: Create Firewall Policy from Scratch**

```bash
# Backup current rules
sudo sh -c 'iptables-save > /etc/iptables/rules.v4.backup'

# Clear all rules (start fresh)
sudo iptables -F
sudo iptables -X

# Set default policies (most secure)
sudo iptables -P INPUT DROP              # Drop all incoming
sudo iptables -P OUTPUT ACCEPT           # Allow all outgoing
sudo iptables -P FORWARD DROP            # Don't route packets

# Allow loopback traffic (essential!)
sudo iptables -A INPUT -i lo -j ACCEPT

# Allow established connections (stateful)
sudo iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT

# Allow SSH from specific network only
sudo iptables -A INPUT -p tcp --dport 22 -s 192.168.1.0/24 -j ACCEPT

# Allow HTTP/HTTPS from anywhere
sudo iptables -A INPUT -p tcp --dport 80 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 443 -j ACCEPT

# Allow DNS responses
sudo iptables -A INPUT -p udp --sport 53 -j ACCEPT

# Log dropped packets (for debugging)
sudo iptables -A INPUT -m limit --limit 5/min -j LOG --log-prefix "IPT-DROP: "
sudo iptables -A INPUT -j DROP

# View final rules
sudo iptables -L -n -v
```

**Task 3: Save Rules Permanently**

```bash
# Install iptables-persistent
sudo apt-get install -y iptables-persistent

# Save current rules
sudo sh -c 'iptables-save > /etc/iptables/rules.v4'

# Rules automatically loaded on boot
sudo systemctl restart iptables-persistent

# Verify rules survived reboot
sudo iptables -L -n | head -20
```

---

## Part 2: Advanced Firewall Techniques

### 🔥 Lab 2: NAT & Port Forwarding

**Task 1: Configure Network Address Translation**

```bash
# Enable IP forwarding (required for NAT)
sudo sysctl -w net.ipv4.ip_forward=1

# Make it permanent
echo "net.ipv4.ip_forward=1" | sudo tee -a /etc/sysctl.conf
sudo sysctl -p

# Configure MASQUERADING (hide internal IPs behind firewall)
sudo iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE

# Now internal clients (192.168.1.0/24) can access internet through firewall
# External servers see all traffic from firewall IP, not client IPs

# Save NAT rules
sudo sh -c 'iptables-save > /etc/iptables/rules.v4'
```

**Task 2: Port Forwarding (Expose Internal Service Safely)**

```bash
# Forward external port 8080 to internal web server
sudo iptables -t nat -A PREROUTING -i eth0 -p tcp --dport 8080 -j DNAT --to-destination 192.168.1.50:80

# Also allow the forwarded traffic
sudo iptables -A FORWARD -i eth0 -o eth1 -p tcp --dport 80 -d 192.168.1.50 -m state --state NEW,ESTABLISHED -j ACCEPT
sudo iptables -A FORWARD -i eth1 -o eth0 -m state --state ESTABLISHED,RELATED -j ACCEPT

# Verify
sudo iptables -t nat -L -n -v
# Should show: tcp dpt:8080 DNAT to 192.168.1.50:80
```

**Task 3: Rate Limiting with IPTables**

```bash
# Limit SSH to 3 connections per minute from same IP
sudo iptables -A INPUT -p tcp --dport 22 -m limit --limit 3/min --limit-burst 3 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 22 -j DROP

# Limit HTTP requests to 50 per second per IP
sudo iptables -A INPUT -p tcp --dport 80 -m limit --limit 50/sec --limit-burst 100 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 80 -j DROP

# View rate limit rules
sudo iptables -L INPUT -n | grep limit
```

---

## Part 3: Firewall Monitoring

### 🔥 Lab 3: Monitor & Debug Firewall

**Task 1: Enable Drop Logging**

```bash
# Create chain for logging dropped packets
sudo iptables -N LOGGING
sudo iptables -A INPUT -j LOGGING
sudo iptables -A LOGGING -m limit --limit 5/min -j LOG --log-prefix "IPT-DROP: " --log-level 7
sudo iptables -A LOGGING -j DROP

# View firewall logs
sudo tail -f /var/log/kern.log | grep IPT-DROP

# Parse logs
sudo grep IPT-DROP /var/log/kern.log | \
  awk '{print $(NF-2)}' | cut -d= -f2 | sort | uniq -c | sort -rn
# Shows top dropped source IPs
```

**Task 2: Analyze Traffic with Connection Tracking**

```bash
# View active connections
sudo iptables -t mangle -L -n -v | head -20

# Count established connections
ss -antp | grep ESTABLISHED | wc -l

# Connections per port
ss -antp | grep ESTABLISHED | awk '{print $4}' | cut -d: -f2 | sort | uniq -c | sort -rn
```

**Task 3: Firewall Health Check Script**

```bash
cat > /usr/local/bin/firewall-health.sh << 'EOF'
#!/bin/bash

echo "=== FIREWALL HEALTH CHECK ==="
echo "Date: $(date)"
echo

echo "[RULE COUNT]"
echo "INPUT rules: $(sudo iptables -L INPUT -n | grep -c "^")"
echo "OUTPUT rules: $(sudo iptables -L OUTPUT -n | grep -c "^")"
echo "FORWARD rules: $(sudo iptables -L FORWARD -n | grep -c "^")"

echo
echo "[DROPPED PACKETS (Last Hour)]"
sudo grep IPT-DROP /var/log/kern.log | tail -10 | awk '{print $(NF-6), $(NF-2)}' | cut -d= -f2 | sort | uniq -c | sort -rn

echo
echo "[ESTABLISHED CONNECTIONS]"
ss -antp | grep ESTABLISHED | wc -l
echo "active connections"

echo
echo "[FAILED RULES (Rate Limit Hits)]"
sudo iptables -L INPUT -nvx | grep -E "Drop|limit"

echo
echo "[IP FORWARDING STATUS]"
cat /proc/sys/net/ipv4/ip_forward
EOF

chmod +x /usr/local/bin/firewall-health.sh
./usr/local/bin/firewall-health.sh
```

---

## ✅ Completion Checklist

- [ ] Understood iptables chains (INPUT, OUTPUT, FORWARD)
- [ ] Created firewall rules from scratch
- [ ] Configured stateful packet filtering
- [ ] Set appropriate default policies
- [ ] Allowed specific services (SSH, HTTP, HTTPS)
- [ ] Configured NAT and masquerading
- [ ] Set up port forwarding
- [ ] Implemented rate limiting
- [ ] Enabled firewall logging
- [ ] Created firewall health check script

**Next Week:** Advanced network defense and threat hunting.
