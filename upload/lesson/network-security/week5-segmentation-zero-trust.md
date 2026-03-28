# Week 5: Network Segmentation & Zero Trust

## 🎯 Learning Outcomes

By the end of this week, you will:

- Understand network segmentation principles
- Implement VLANs for traffic isolation
- Configure zero-trust network architecture
- Set up DMZ (demilitarized zone)
- Implement microsegmentation
- Monitor segmented networks

---

## 📚 Module Overview

| Aspect       | Details                                   |
| ------------ | ----------------------------------------- |
| **Duration** | 1 week                                    |
| **Concepts** | VLANs, DMZ, microsegmentation, zero-trust |
| **Labs**     | 3 hands-on segmentation labs              |
| **Focus**    | Network isolation, least privilege access |

---

## Part 1: VLAN Configuration

### 🔌 Lab 1: Create Isolated Network Segments

**Task 1: Understanding VLANs**

```bash
# VLANs logically separate traffic even on same physical switch
# Example topology:
# └─ Physical Network (LAN)
#    ├─ VLAN 10: DMZ (web servers) - 10.10.0.0/24
#    ├─ VLAN 20: Internal (users) - 10.20.0.0/24
#    ├─ VLAN 30: Database (DB servers) - 10.30.0.0/24
#    └─ VLAN 40: Management (admin) - 10.40.0.0/24

# Traffic between VLANs blocked by default!
# Only router can move traffic between VLANs

# Install VLAN tools
sudo apt-get install -y vlan

# Create VLAN interfaces
sudo modprobe 8021q

# VLAN 10 (DMZ)
sudo vconfig add eth0 10
sudo ifconfig eth0.10 10.10.0.1 netmask 255.255.255.0 up

# VLAN 20 (Internal)
sudo vconfig add eth0 20
sudo ifconfig eth0.20 10.20.0.1 netmask 255.255.255.0 up

# VLAN 30 (Database)
sudo vconfig add eth0 30
sudo ifconfig eth0.30 10.30.0.1 netmask 255.255.255.0 up

# VLAN 40 (Management)
sudo vconfig add eth0 40
sudo ifconfig eth0.40 10.40.0.1 netmask 255.255.255.0 up

# View VLAN configuration
ip link show | grep 'eth0\.'
# eth0.10@eth0: (VLAN 10)
# eth0.20@eth0: (VLAN 20)
# eth0.30@eth0: (VLAN 30)
# eth0.40@eth0: (VLAN 40)
```

**Task 2: Create Routing Rules Between VLANs**

```bash
# By default, VLANs are isolated (good security!)
# But we need some controlled routing

# Allow DMZ → Internet
sudo iptables -A FORWARD -i eth0.10 -o eth0 -j ACCEPT
sudo iptables -A FORWARD -i eth0 -o eth0.10 -m state --state ESTABLISHED,RELATED -j ACCEPT

# Allow Internal → DMZ (users can access web servers)
sudo iptables -A FORWARD -i eth0.20 -o eth0.10 -j ACCEPT
sudo iptables -A FORWARD -i eth0.10 -o eth0.20 -m state --state ESTABLISHED,RELATED -j ACCEPT

# BLOCK Internal → Database (web servers access DB, not users!)
sudo iptables -A FORWARD -i eth0.20 -o eth0.30 -j DROP
sudo iptables -A FORWARD -i eth0.30 -o eth0.20 -j DROP

# Allow Database → Internal (DB can log only)
sudo iptables -A FORWARD -i eth0.30 -o eth0.20 -p tcp --dport 514 -j ACCEPT  # syslog

# Allow Management → All (admins need full access for troubleshooting)
sudo iptables -A FORWARD -i eth0.40 -j ACCEPT
sudo iptables -A FORWARD -o eth0.40 -j ACCEPT

# Test segmentation
# From VLAN 20 client, try to reach VLAN 30:
ping 10.30.0.50
# Request timeout ✅ (properly isolated)

# From VLAN 10 client, try to reach internet:
ping 8.8.8.8
# Success ✅
```

---

## Part 2: DMZ Design

### 🔌 Lab 2: Set Up Security Perimeter

**Task 1: Create DMZ Architecture**

```bash
# DMZ contains public-facing services (web, email, DNS)
# Isolated from internal network
# If DMZ is compromised, internal network still protected

# Network diagram:
#           Internet (untrusted)
#                 ↓ [Firewall 1]
#           DMZ VLAN (10.10.0.0/24)
#           │── Web Server 1 (10.10.0.50)
#           │── Web Server 2 (10.10.0.51)
#           │── Mail Server (10.10.0.52)
#           │── DNS Server (10.10.0.53)
#                 ↓ [Firewall 2 - Internal Firewall]
#           Internal VLAN (10.20.0.0/24)
#           │── User Workstations
#           │── File Servers
#           │── Database Servers (on separate VLAN)

# Configure external firewall (Firewall 1)
# Allow Internet → DMZ services only
sudo iptables -A FORWARD -i eth0 -o eth0.10 -p tcp --dport 80 -j ACCEPT    # HTTP
sudo iptables -A FORWARD -i eth0 -o eth0.10 -p tcp --dport 443 -j ACCEPT   # HTTPS
sudo iptables -A FORWARD -i eth0 -o eth0.10 -p tcp --dport 25 -j ACCEPT    # SMTP
sudo iptables -A FORWARD -i eth0 -o eth0.10 -p tcp --dport 53 -j ACCEPT    # DNS

# BLOCK Internet → Internal (security perimeter!)
sudo iptables -A FORWARD -i eth0 -o eth0.20 -j DROP

# Stateful filtering for responses
sudo iptables -A FORWARD -m state --state ESTABLISHED,RELATED -j ACCEPT

# Configure internal firewall (Firewall 2)
# Allow DMZ → Database only for specific queries
sudo iptables -A FORWARD -i eth0.10 -o eth0.30 -p tcp --dport 3306 -d 10.30.0.1 -j ACCEPT  # MySQL from web servers
sudo iptables -A FORWARD -i eth0.10 -o eth0.30 -p tcp --dport 5432 -d 10.30.0.2 -j ACCEPT  # PostgreSQL

# BLOCK DMZ → Internal user network
sudo iptables -A FORWARD -i eth0.10 -o eth0.20 -j DROP

# Allow Internal → DMZ read-only
sudo iptables -A FORWARD -i eth0.20 -o eth0.10 -j ACCEPT
```

**Task 2: Monitor DMZ Traffic**

```bash
# Create DMZ monitoring script
cat > /usr/local/bin/monitor-dmz.sh << 'EOF'
#!/bin/bash

echo "=== DMZ TRAFFIC ANALYSIS ==="
echo "Date: $(date)"
echo

echo "[DMZINGRESS (Internet → DMZ)]"
sudo iptables -L FORWARD -nvx | grep eth0 | grep eth0.10

echo
echo "[DMZ EGRESS (DMZ → Internal)]"
sudo iptables -L FORWARD -nvx | grep eth0.10 | grep eth0.20

echo
echo "[BLOCKED ATTEMPTS]"
sudo iptables -L FORWARD -nvx | grep DROP | head -10

echo
echo "[TOP PROTOCOLS TO DMZ]"
sudo tcpdump -i eth0.10 -n | awk '{print $NF}' | cut -d/ -f1 | sort | uniq -c | sort -rn | head
EOF

chmod +x /usr/local/bin/monitor-dmz.sh
```

---

## Part 3: Microsegmentation

### 🔌 Lab 3: Zero-Trust Network Principles

**Task 1: Implement Microsegmentation**

```bash
# Traditional: Trust network→less secure
# Zero-trust: Trust NOTHING, authenticate/authorize EVERYTHING

# Microsegmentation: Every workload has its own security policy
# Example: Each microservice in separate security zone

# Create security zones (smaller than VLANs):
# Zone 1: API Gateway (port 443)
# Zone 2: Frontend Service (port 3000)
# Zone 3: Backend Service (port 8080)
# Zone 4: Database (port 5432)

# Only allow explicit paths:
# Internet → API Gateway
# API Gateway → Frontend
# Frontend → Backend
# Backend → Database
# Everything else DENIED

# Implement with iptables namespaces
sudo ip netns add api_gateway
sudo ip netns add frontend_svc
sudo ip netns add backend_svc
sudo ip netns add database

# Configure API Gateway namespace
sudo ip netns exec api_gateway iptables -A INPUT -p tcp --dport 443 -j ACCEPT
sudo ip netns exec api_gateway iptables -A OUTPUT -p tcp --dport 3000 -j ACCEPT  # to frontend

# Configure Frontend namespace
sudo ip netns exec frontend_svc iptables -A INPUT -p tcp --dport 3000 -s api_gateway -j ACCEPT
sudo ip netns exec frontend_svc iptables -A OUTPUT -p tcp --dport 8080 -j ACCEPT  # to backend

# Configure Backend namespace
sudo ip netns exec backend_svc iptables -A INPUT -p tcp --dport 8080 -s frontend_svc -j ACCEPT
sudo ip netns exec backend_svc iptables -A OUTPUT -p tcp --dport 5432 -j ACCEPT  # to database

# Configure Database namespace
sudo ip netns exec database iptables -A INPUT -p tcp --dport 5432 -s backend_svc -j ACCEPT
sudo ip netns exec database iptables -A OUTPUT -j DROP  # NO outbound

# Test: Services can only communicate on allowed paths
```

**Task 2: Zero-Trust Policy Enforcement**

```bash
# Create zero-trust rules file
cat > /etc/network/zero-trust-rules.sh << 'EOF'
#!/bin/bash

# Default DENY all
iptables -P INPUT DROP
iptables -P OUTPUT DROP
iptables -P FORWARD DROP

# Allow local traffic ONLY
iptables -A INPUT -i lo -j ACCEPT
iptables -A OUTPUT -o lo -j ACCEPT

# Allow established connections
iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT
iptables -A OUTPUT -m state --state ESTABLISHED,RELATED -j ACCEPT

# Explicit allow only:
# 1. Inbound from users to web servers (port 443)
iptables -A INPUT -p tcp --dport 443 -m state --state NEW -j ACCEPT

# 2. Outbound from web to API (port 8080)
iptables -A OUTPUT -p tcp --dport 8080 -m state --state NEW -j ACCEPT

# 3. Outbound DNS only (port 53)
iptables -A OUTPUT -p udp --dport 53 -m state --state NEW -j ACCEPT

# All other traffic DENIED (logged)
iptables -A INPUT -j LOG --log-prefix "DENIED-IN: "
iptables -A OUTPUT -j LOG --log-prefix "DENIED-OUT: "

echo "Zero-trust rules applied"
EOF

sudo chmod +x /etc/network/zero-trust-rules.sh
```

**Task 3: Create Network Policy Dashboard**

```bash
cat > /usr/local/bin/network-policy-status.sh << 'EOF'
#!/bin/bash

echo "=== NETWORK SEGMENTATION STATUS ==="
echo

echo "[VLANS CONFIGURED]"
ip link show | grep 'eth0\.'

echo
echo "[ROUTING POLICIES]"
sudo iptables -L FORWARD -nvx | grep -E "(ACCEPT|DROP)" | wc -l
echo "forward rules total"

echo
echo "[BLOCKED TRAFFIC ATTEMPTS]"
sudo grep "DROP" /var/log/kern.log | wc -l
echo "drops logged today"

echo
echo "[ACTIVE FLOWS]"
ss -antp | grep ESTABLISHED | wc -l
echo "connections"

echo
echo "[ZERO-TRUST VIOLATIONS]"
sudo grep "DENIED" /var/log/kern.log | tail -5
EOF

chmod +x /usr/local/bin/network-policy-status.sh
```

---

## ✅ Completion Checklist

- [ ] Created VLANs for network segments (DMZ, Internal, DB, Mgmt)
- [ ] Configured VLAN interfaces
- [ ] Set up routing rules between VLANs
- [ ] Tested VLAN isolation
- [ ] Designed DMZ architecture
- [ ] Configured external firewall (Internet boundary)
- [ ] Configured internal firewall (business logic boundary)
- [ ] Monitored DMZ traffic
- [ ] Implemented microsegmentation
- [ ] Applied zero-trust network principles
- [ ] Created network policy enforcement
- [ ] Built network status dashboard

**Next Week:** Threat hunting and advanced network forensics.
