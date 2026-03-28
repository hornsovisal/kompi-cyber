# Week 6: Threat Hunting & Network Forensics

## 🎯 Learning Outcomes

By the end of this week, you will:

- Hunt for threats using network data
- Analyze suspicious network behaviors
- Perform forensic analysis of network incidents
- Create hunt hypotheses and test them
- Build threat intelligence feeds
- Conduct pivot analysis on indicators

---

## 📚 Module Overview

| Aspect       | Details                                   |
| ------------ | ----------------------------------------- |
| **Duration** | 1 week                                    |
| **Tools**    | Wireshark, ELK Stack, YARA, osquery       |
| **Labs**     | 3 hands-on threat hunting labs            |
| **Focus**    | Proactive threat detection, investigation |

---

## Part 1: Network Threat Hunting

### 🔍 Lab 1: Hunt for Command & Control (C2) Communication

**Task 1: Identify Suspicious DNS Queries**

```bash
# Hunt hypothesis: "Users are communicating with C2 through DNS tunneling"

# Capture DNS traffic
sudo tcpdump -i eth0 -n 'port 53' -w dns_traffic.pcap &

# Simulate DNS tunneling (exfiltrate data through DNS)
# (In real incident, attacker would do this)
# Query with unusual domain patterns: exfil.attacker.com, data1234567890.c2.com

# Analyze captured traffic
tshark -r dns_traffic.pcap -Y 'dns.query' -T fields -e dns.qry.name | sort | uniq -c | sort -rn

# Look for suspicious patterns:
# 1. High volume of queries to same C2 domain
tshark -r dns_traffic.pcap -Y 'dns' -T fields -e dns.qry.name | grep -E '^([a-z0-9]){32,}'
# Long random strings = possible tunneling

# 2. Unusual TLDs (.ru, .cn, .biz - common for malware)
tshark -r dns_traffic.pcap -Y 'dns' -T fields -e dns.qry.name | grep -E '\.(ru|cn|biz|top|xyz)$'

# 3. Queries from unusual internal IPs
tshark -r dns_traffic.pcap -Y 'dns' -T fields -e ip.src | sort | uniq -c | sort -rn
# If 10.30.0.50 (database server) making DNS queries = suspicious!

# Investigation:
# Create hunt artifact file
cat > /tmp/c2_indicators.txt << 'EOF'
SUSPICIOUS_DOMAIN: attacker.biz
SUSPICIOUS_IP: 203.0.113.45
SUSPICIOUS_PATTERN: ^([a-z0-9]){32,}\.com$

Hunt Timeline:
- 02:15 AM: First DNS query to attacker.biz (source: 192.168.1.100)
- 02:16-02:45 AM: 234 queries to attacker.biz (rate: 8/min)
- 02:45 AM: Data exfiltration confirmed (53MB transferred)

Verdict: LIKELY C2 COMMUNICATION DETECTED
EOF
```

**Task 2: Detect Data Exfiltration**

```bash
# Hunt hypothesis: "Sensitive data being exfiltrated to external server"

# Baseline: Normal data transfer per user
# Example: User1 avg 2MB/day, User2 avg 1MB/day

# Sample baseline stats
cat > /tmp/baseline_stats.txt << 'EOF'
[NORMAL VOLUME BASELINE]
User1 (192.168.1.50): avg 2MB outbound/day
User2 (192.168.1.51): avg 1.5MB outbound/day
Database (10.30.0.1): avg 500MB outbound/day (backups)
EOF

# Monitor for outliers (>3x normal = suspicious)
cat > /usr/local/bin/hunt-exfil.sh << 'EOF'
#!/bin/bash

# Get daily traffic per IP
sudo iftop -i eth0 -n -t -s 3600 | grep -E '[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}' | \
  awk '{print $1, $2}' | column -t | tee /tmp/current_traffic.txt

# Compare to baseline
echo "Checking for anomalies..."
while read ip bytes; do
    baseline=$(grep "$ip" /tmp/baseline_stats.txt | awk '{print $NF}')
    if [ -z "$baseline" ]; then
        echo "NEW IP DETECTED: $ip sent $bytes"
    elif [ "$bytes" -gt $((baseline * 3)) ]; then
        echo "ALERT: $ip exceeded baseline (baseline: $baseline, actual: $bytes)"
    fi
done < /tmp/current_traffic.txt
EOF

chmod +x /usr/local/bin/hunt-exfil.sh
```

**Task 3: Lateral Movement Detection**

```bash
# Hunt hypothesis: "Attacker moving between systems (lateral movement)"

# Lateral movement indicators:
# 1. Admin access from unusual source
# 2. Port scanning/reconnaissance
# 3. Service enumeration
# 4. Credential dumping tools accessing LSASS (Windows) or /etc/shadow (Linux)

# Monitor for SMB lateral movement (Windows)
sudo tcpdump -i eth0 -n 'port 445' -w smb_traffic.pcap

# Analyze SMB connections (possible lateral movement)
tshark -r smb_traffic.pcap -Y 'smb' -T fields -e ip.src -e ip.dst | sort | uniq -c

# Hunt example - detect suspicious RDP sessions
# (Remote Desktop Protocol = common lateral movement tool)
tshark -r network.pcap -Y 'tcp.dstport == 3389' | wc -l
# If > 5 connections to RDP port from unusual IPs = hunt signal

# Create lateral movement detection rule
cat > /etc/suricata/rules/lateral-movement.rules << 'EOF'
# Detect port scanning (signs of reconnaissance)
alert icmp any any -> any any (
  msg:"ICMP Ping Sweep Detected";
  icmp_type:8;
  threshold: type threshold, track by_src, count 100, seconds 60;
  sid:3000001;
)

# Detect SMB/445 from unusual source
alert tcp $EXTERNAL_NET any -> $HOME_NET 445 (
  msg:"SMB Access from External Network";
  flow:to_server;
  classtype:lateral-movement;
  sid:3000002;
)

# Detect RDP brute force (lateral movement credential attack)
alert tcp any any -> any 3389 (
  msg:"RDP Brute Force - Lateral Movement";
  flow:to_server;
  threshold: type threshold, track by_src, count 10, seconds 60;
  sid:3000003;
)
EOF
```

---

## Part 2: Threat Intelligence & Pivot Analysis

### 🔍 Lab 2: Build Threat Intelligence

**Task 1: Create IOC (Indicators of Compromise) Database**

```bash
# IOCs are signatures of attacker activity
# Types: IP, domain, file hash, email, URLs

# Create IOC collection
cat > /tmp/iocs.txt << 'EOF'
[IPS]
203.0.113.45       - Known C2 server (Emotet)
198.51.100.200     - Botnet proxy node
192.168.1.100      - Compromised internal system

[DOMAINS]
attacker.biz       - C2 domain
malware-download.ru - Malware distribution
phishing-link.tk    - Phishing domain

[FILE HASHES]
5d41402abc4b2a76b9719d911017c592 - Zeus banking trojan
356a192b7913b04c54574d18c28d46e6 - Mirai botnet binary

[EMAIL ADDRESSES]
attacker@protonmail.com - Spear phishing campaign
c2admin@riseup.net      - C2 administrator

[URLS]
http://attacker.biz/update.exe       - Malware download
http://c2.ru/beacon?id=123          - C2 checkin
EOF

# Threat intelligence feed sources:
# - MISP (Malware Information Sharing Platform)
# - VirusTotal
# - AlienVault OTX
# - Shodan
# - Censys

# Search for IOCs in network traffic
cat > /usr/local/bin/hunt-ioc.sh << 'EOF'
#!/bin/bash

IOC_FILE="/tmp/iocs.txt"

echo "=== HUNTING FOR IOCS ==="
echo

# Hunt IP indicators
echo "[MATCHING IP ADDRESSES]"
while read ip; do
    [ -z "$ip" ] && continue
    count=$(sudo tcpdump -i eth0 -n | grep "$ip" | wc -l)
    if [ "$count" -gt 0 ]; then
        echo "FOUND: $ip ($count packets)"
    fi
done < <(grep "^\[IPS\]" -A 10 $IOC_FILE | grep -v "^\[" | awk '{print $1}')

# Hunt domain indicators
echo
echo "[MATCHING DOMAINS]"
while read domain; do
    [ -z "$domain" ] && continue
    count=$(sudo tcpdump -i eth0 -n | grep "$domain" | wc -l)
    if [ "$count" -gt 0 ]; then
        echo "FOUND: $domain ($count packets)"
    fi
done < <(grep "^\[DOMAINS\]" -A 10 $IOC_FILE | grep -v "^\[" | awk '{print $1}')
EOF

chmod +x /usr/local/bin/hunt-ioc.sh
```

**Task 2: Pivot Analysis (From One Indicator to Related)**

```bash
# Example: You find IP 203.0.113.45 communicating with your network
# Pivot to find all related indicators

# Pivot 1: What domains does this IP resolve to?
nslookup 203.0.113.45
# attacker.biz
# malware-c2.ru
# phishing-link.tk

# Pivot 2: What other IPs host these domains?
nslookup attacker.biz
# 203.0.113.45
# 198.51.100.200 (secondary - also involved!)

# Pivot 3: What SSL certificates are used?
sudo tcpdump -i eth0 -n 'port 443' -X | grep -A 5 'CN='
# Common Name: attacker.biz
# Issuer: Let's Encrypt (can find other domains with same cert)

# Pivot 4: What files were downloaded from this server?
sudo tcpdump -i eth0 -n 'host 203.0.113.45' -XX | grep -E '(\.exe|\.dll|\.bin)'
# update.exe (hash: 5d41402abc4b2a76b9719d911017c592)
# (match with known trojan in our IOC database!)

# Create pivot analysis document
cat > /tmp/pivot_report.txt << 'EOF'
PIVOT ANALYSIS REPORT
Starting IOC: IP 203.0.113.45

[PIVOT RESULTS]
Found IOC: attacker.biz
Found IOC: malware-c2.ru
Found IOC: phishing-link.tk
Found IOC: 198.51.100.200 (secondary C2)
Found IOC: update.exe (5d41402abc4b2a76b9719d911017c592)

[INFECTED SYSTEMS]
192.168.1.100 - User workstation (contacted C2)
192.168.1.101 - User workstation (contacted C2)
10.30.0.50 - Database server (suspicious)

[TIMELINE]
2026-03-28 02:15 - First contact to 203.0.113.45
2026-03-28 02:16 - Multiple systems contacting same C2
2026-03-28 02:45 - Large data transfer to C2

[RECOMMENDATIONS]
1. Isolate infected systems (192.168.1.100, 192.168.1.101, 10.30.0.50)
2. Block all IPs/domains in IOC database at perimeter firewall
3. Hunt for attacker lateral movement
4. Check for persistence mechanisms (scheduled tasks, cron jobs, backdoor accounts)
5. Review logs from 30 days prior (when attack likely started)
EOF
```

---

## Part 3: Advanced Hunting Techniques

### 🔍 Lab 3: Behavioral Analysis & Machine Learning

**Task 1: Detect Anomalous Behavior**

```bash
# Create user behavior baseline
cat > /tmp/user_baseline.sh << 'EOF'
#!/bin/bash

# Collect baseline behaviors for each user
echo "=== CREATING USER BEHAVIOR BASELINE ==="

# Normal user Alice:
# - Logins: 9:00 AM - 5:00 PM (business hours)
# - Typical data transfer: 100 MB - 500 MB/day
# - Normal ports: 80, 443, 22 (web, email, SSH)
# - Normal destinations: company servers, Google, GitHub

# Anomalies to detect:
# 1. Login at 2:00 AM (unusual time)
# 2. 5 GB data transfer (vs normal 100-500 MB)
# 3. Connection to port 4444 (C2 common port)
# 4. Connection to foreign IP (203.0.113.45)

# Collect baseline stats
ss -antp | grep ESTABLISHED | awk '{print $4, $5}' > /tmp/alice_baseline.txt

EOF

chmod +x /tmp/user_baseline.sh
```

**Task 2: Create Hunt Queries (ELK Stack)**

```bash
# Example: Elasticsearch queries for threat hunting
# Setup: ELK Stack (Elasticsearch, Logstash, Kibana)

# Hunt query 1: Find users with 10x normal data transfer
# Kibana query:
# source:* AND bytes > 5000000 AND user_type:"normal_user"

# Hunt query 2: Find connections to known C2 domains
# Kibana query:
# destination_domain:(attacker.biz OR malware-c2.ru OR phishing-link.tk)

# Hunt query 3: Admin logins after hours
# Kibana query:
# event_type:login AND user_group:admin AND hour:[22 TO 8]

# Hunt query 4: Port scanning activity
# Kibana query:
# event_type:connection AND
# destination_port >= 1 AND destination_port <= 65535 AND
# count_by_source:100+

# Export hunt results
# Create CSV with:
# - Source IP
# - Destination
# - Bytes transferred
# - Timestamp
# - Associated user
```

**Task 3: Hunting Playbook**

```bash
cat > /tmp/hunting_playbook.md << 'EOF'
# THREAT HUNTING PLAYBOOK

## Hunt 1: Data Exfiltration
**Hypothesis:** Sensitive data is being stolen via network

**Data Sources:**
- Network traffic (pcap)
- System logs
- Firewall logs

**Hunt Steps:**
1. Baseline normal outbound traffic per user/system
2. Identify outliers (>3x normal)
3. Identify connections to external IPs
4. Correlate with file access logs
5. Check for compression/encryption (indicators of bundling data)

**Result:** If found, isolate system and begin forensics

## Hunt 2: Command & Control Communication
**Hypothesis:** Compromised systems calling to C2 servers

**Data Sources:**
- DNS traffic
- Network connections
- IDS/IPS alerts

**Hunt Steps:**
1. Check for connections to known C2 IPs/domains
2. Look for DNS tunneling (unusual query patterns)
3. Monitor for beaconing (regular connection intervals)
4. Check for HTTPS/encryption (hiding traffic)
5. Temporal analysis (always happens at same time?)

**Result:** If found, determine when infection occurred, pivot for other systems

## Hunt 3: Lateral Movement
**Hypothesis:** Attacker moving between systems

**Data Sources:**
- SMB/RDP traffic
- SSH logs
- Firewall logs

**Hunt Steps:**
1. Baseline normal inter-system communication
2. Look for admin access from unusual sources
3. Scan for RDP/SSH brute force
4. Monitor for service enumeration (port scanning between systems)
5. Check for credential dumping tools

**Result:** If found, determine compromise vector and containment steps
EOF

cat /tmp/hunting_playbook.md
```

---

## ✅ Completion Checklist

- [ ] Hunted for C2 communication using DNS analysis
- [ ] Detected data exfiltration patterns
- [ ] Monitored for lateral movement indicators
- [ ] Created IOC (Indicators of Compromise) database
- [ ] Performed pivot analysis from one IOC to related indicators
- [ ] Found infected systems through tracking
- [ ] Used threat intelligence feeds
- [ ] Developed behavioral baselines for users
- [ ] Created hunt queries in ELK Stack
- [ ] Documented hunting playbooks
- [ ] Tested threat hunting methodology

## 🏆 Congratulations!

You've completed the **Network Security course** with practical, hands-on labs:

- ✓ Packet analysis and protocol understanding
- ✓ Attack detection and IDS/IPS configuration
- ✓ Firewall hardening
- ✓ Secure VPN tunnels
- ✓ Network segmentation and zero-trust
- ✓ Threat hunting and forensics

**You can now:**

- Monitor networks for intrusions
- Respond to network attacks
- Hunt for threats proactively
- Conduct network forensics
- Design secure network architecture
