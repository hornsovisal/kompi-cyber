# Week 2: Network Attacks & Intrusion Detection

## 🎯 Learning Outcomes

By the end of this week, you will:

- Understand common network attacks (DoS, DDoS, Man-in-the-Middle)
- Perform penetration tests using hping and nmap
- Set up Suricata IDS for attack detection
- Create detection rules
- Analyze attack traffic
- Identify attack patterns in network logs

---

## 📚 Module Overview

| Aspect              | Details                                          |
| ------------------- | ------------------------------------------------ |
| **Duration**        | 1 week                                           |
| **Attacks Covered** | SYN flood, UDP flood, ARP spoofing, DNS spoofing |
| **Tools**           | hping3, Suricata, snort, netcat                  |
| **Labs**            | 3 hands-on attack simulation and detection labs  |

---

## Part 1: Network Attack Types

### 🎯 Lab 1: Detect & Analyze DoS Attacks

**Objective:** Simulate and detect Denial of Service attacks.

**Task 1: SYN Flood Detection**

```bash
# Install hping3 (custom packet tool)
sudo apt-get install -y hping3

# Simulate SYN flood attack (fill up server queue)
sudo hping3 -S --flood -p 80 target_server.com
# -S = SYN packets
# --flood = send as fast as possible
# -p 80 = target port

# On victim's server - detect the attack
sudo tcpdump -i eth0 'tcp[tcpflags] & tcp-syn != 0' | head -20
# Shows incoming SYN packets

# Count SYN packets per source
sudo tcpdump -i eth0 -n 'tcp[tcpflags] & tcp-syn != 0' | \
  awk '{print $(NF-2)}' | cut -d. -f1-3 | sort | uniq -c | sort -rn
# Output:
# 5000 192.168.1.100    <- Attacker IP!
# 10 192.168.1.50
# 5 192.168.1.75

# Mitigation: Enable SYN cookies
sudo sysctl -w net.ipv4.tcp_syncookies=1

# Limit SYN queue
sudo sysctl -w net.ipv4.tcp_max_syn_backlog=2048
```

**Task 2: UDP Flood Detection**

```bash
# Simulate UDP flood (sending to random ports)
sudo hping3 --udp --flood -p 53 target_server.com

# Detect on victim side
sudo tcpdump -i eth0 'udp' -c 100 | tail -10
# Shows all UDP traffic

# Count UDP packets per source
sudo tcpdump -i eth0 -n 'udp' | \
  awk '{print $(NF-2)}' | sort | uniq -c | sort -rn | head
# Large spike from one IP = UDP flood
```

**Task 3: ICMP Flood (Ping Flood)**

```bash
# Simulate ICMP flood
ping -f attacker_ip
# -f = flood (sends as fast as possible)

# Detect ICMP traffic
sudo tcpdump -i eth0 'icmp' | wc -l
# Count ICMP packets

# Block excessive ICMP
sudo iptables -A INPUT -p icmp -m limit --limit 1/s --limit-burst 1 -j ACCEPT
sudo iptables -A INPUT -p icmp -j DROP
```

---

## Part 2: Intrusion Detection System (IDS)

### 🎯 Lab 2: Set Up Suricata IDS

**Objective:** Deploy IDS to detect intrusions in real-time.

**Task 1: Install Suricata**

```bash
# Install Suricata (open-source IDS)
sudo apt-get install -y suricata

# Check installed version
suricata --version
# Suricata Version 6.0.15

# Start Suricata
sudo systemctl start suricata
sudo systemctl enable suricata

# View status
sudo systemctl status suricata
# active (running) ✅
```

**Task 2: Configure Detection Rules**

```bash
# View detection rules directory
ls -la /etc/suricata/rules/

# Create custom rule file
sudo nano /etc/suricata/rules/custom.rules

# ADD THESE RULES:

# Rule 1: Detect SSH brute force
alert ssh $HOME_NET any -> $EXTERNAL_NET any (msg:"SSH Brute Force Attempt"; flow:to_server,established; content:"SSH"; pcre:"/SSH-2\.0/"; threshold: type both, track by_src, count 5, seconds 60; classtype:attempted-admin; sid:1000001; rev:1;)

# Rule 2: Detect port scanning (many SYN packets, no response)
alert tcp $EXTERNAL_NET any -> $HOME_NET any (msg:"Possible Port Scan"; flags:S; threshold: type threshold, track by_src, count 20, seconds 10; classtype:network-scan; sid:1000002; rev:1;)

# Rule 3: Detect DNS tunneling (unusual DNS queries)
alert dns $HOME_NET any -> $EXTERNAL_NET 53 (msg:"DNS Tunneling Detected"; dns.query; pcre:"/^([a-z0-9]){32,}\.com$/i"; classtype:command-and-control; sid:1000003; rev:1;)

# Rule 4: Detect HTTP SQL injection attempt
alert http $EXTERNAL_NET any -> $HOME_NET any (msg:"SQL Injection Detected"; flow:to_server; content:"union"; nocase; http_uri; classtype:web-application-attack; sid:1000004; rev:1;)

# Rule 5: Detect XSS attempt
alert http $EXTERNAL_NET any -> $HOME_NET any (msg:"XSS Attack Detected"; flow:to_server; content:"<script"; nocase; http_uri; classtype:web-application-attack; sid:1000005; rev:1;)
```

**Task 3: Monitor IDS Alerts**

```bash
# View real-time alerts
sudo tail -f /var/log/suricata/eve.json | jq '.'

# Output shows detected events:
# {
#   "timestamp": "2026-03-28T14:32:15.123456+0000",
#   "flow_id": 1234567890,
#   "event_type": "alert",
#   "alert": {
#     "action": "denied",
#     "gid": 1,
#     "signature_id": 1000001,
#     "signature": "SSH Brute Force Attempt",
#     "category": "Attempted Admin Access",
#     "severity": 2
#   },
#   "src_ip": "203.0.113.45",
#   "src_port": 54321,
#   "dest_ip": "192.168.1.100",
#   "dest_port": 22,
#   "proto": "TCP"
# }

# Parse alerts to find unique ones
sudo jq '.alert.signature' /var/log/suricata/eve.json | sort | uniq -c | sort -rn

# Find high-severity alerts
sudo jq 'select(.alert.severity <= 2)' /var/log/suricata/eve.json | head -20
```

---

## Part 3: Advanced IDS Tuning

### 🎯 Lab 3: Create Custom Detection Rules

**Task 1: Write Detection Rule for Malware C2**

```bash
# Rule to detect known botnet C2 communication
cat > /etc/suricata/rules/malware.rules << 'EOF'
# Detect Emotet botnet C2 domains
alert dns $HOME_NET any -> $EXTERNAL_NET 53 (
  msg:"Emotet C2 Domain Detected";
  dns.query;
  content:"emotet";
  classtype:command-and-control;
  sid:2000001;
  rev:1;
)

# Detect known C2 IP addresses
alert ip $HOME_NET any -> 203.0.113.45 any (
  msg:"Known C2 Server Connection";
  classtype:command-and-control;
  sid:2000002;
  rev:1;
)

# Detect suspicious large file transfers (potential data exfiltration)
alert http $HOME_NET any -> $EXTERNAL_NET any (
  msg:"Possible Data Exfiltration - Large File Upload";
  flow:to_server;
  content:"POST";
  http_method;
  file.size:>5000000;
  classtype:exfiltration;
  sid:2000003;
  rev:1;
)
EOF
```

**Task 2: Test Rules with Sample Traffic**

```bash
# Create test packet that will trigger SSH brute force rule
sudo hping3 -p 22 -S --count 10 target_server.com

# Check if alert was generated
sudo tail -20 /var/log/suricata/eve.json | jq 'select(.alert.signature=="SSH Brute Force Attempt")'

# Should see alert with source IP and timestamp
```

**Task 3: Generate Alerts Report**

```bash
# Daily alert summary
cat > /usr/local/bin/ids-report.sh << 'EOF'
#!/bin/bash

echo "=== SURICATA IDS DAILY REPORT ==="
echo "Date: $(date)"
echo

echo "[ALERT SUMMARY]"
jq '.alert.signature' /var/log/suricata/eve.json | sort | uniq -c | sort -rn | head -10

echo
echo "[TOP ATTACKER IPs]"
jq '.src_ip' /var/log/suricata/eve.json | sort | uniq -c | sort -rn | head -5

echo
echo "[SEVERITY BREAKDOWN]"
jq '.alert.severity' /var/log/suricata/eve.json | sort | uniq -c

echo
echo "[LAST 5 ALERTS]"
jq '.alert.signature' /var/log/suricata/eve.json | tail -5
EOF

chmod +x /usr/local/bin/ids-report.sh
./usr/local/bin/ids-report.sh
```

---

## ✅ Completion Checklist

- [ ] Simulated SYN flood attack
- [ ] Detected and analyzed DoS traffic
- [ ] Simulated UDP flood
- [ ] Simulated ICMP flood
- [ ] Installed Suricata IDS
- [ ] Created custom detection rules
- [ ] Monitored IDS alerts in real-time
- [ ] Wrote rule for malware C2 detection
- [ ] Tested rules with sample attacks
- [ ] Generated IDS alert reports

**Next Week:** Firewall hardening and advanced network defense.
