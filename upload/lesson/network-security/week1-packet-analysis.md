# Week 1: Network Fundamentals & Packet Analysis

## 🎯 Learning Outcomes

By the end of this week, you will:

- Understand OSI model and TCP/IP layers
- Perform packet capture and analysis with Wireshark
- Identify protocols and network communication patterns
- Recognize normal vs malicious traffic
- Set up network sniffing labs
- Create network baselines

---

## 📚 Module Overview

| Aspect       | Details                                                   |
| ------------ | --------------------------------------------------------- |
| **Duration** | 1 week                                                    |
| **Tools**    | Wireshark, tcpdump, tshark, netcat                        |
| **Labs**     | 3 hands-on packet analysis labs                           |
| **Focus**    | Network fundamentals, protocol analysis, threat detection |

---

## Part 1: OSI Model & Network Layers

### 📡 Lab 1: Packet Structure & Protocol Analysis

**Objective:** Understand how packets are structured and identify protocols.

**Task 1: Capture Network Traffic**

```bash
# Install Wireshark (GUI packet analyzer)
sudo apt-get install -y wireshark-qt tcpdump tshark

# Launch Wireshark
sudo wireshark &

# OR use command-line tcpdump
# Capture HTTP traffic
sudo tcpdump -i eth0 -n 'port 80' -w http_traffic.pcap
# -i eth0 = interface
# -n = show IP addresses
# port 80 = filter HTTP traffic
# -w = write to file

# Capture HTTPS traffic
sudo tcpdump -i eth0 -n 'port 443' -w https_traffic.pcap

# Capture DNS queries
sudo tcpdump -i eth0 -n 'port 53' -w dns_traffic.pcap

# View captured packets in real-time
sudo tcpdump -i eth0 -n 'tcp' -v
# Output:
# IP 192.168.1.100.52345 > 8.8.8.8.443: S [SYN] win 65535
# IP 8.8.8.8.443 > 192.168.1.100.52345: S [SYN,ACK] win 65535
# IP 192.168.1.100.52345 > 8.8.8.8.443: . [ACK] ack 1 win 65535
```

**Task 2: Decode HTTP Packets in Wireshark**

```
# In Wireshark GUI:
1. File > Open > http_traffic.pcap
2. You'll see packet list with:
   - Frame (Layer 1: Physical/Data Link)
   - IP (Layer 3: Network)
   - TCP (Layer 4: Transport)
   - HTTP (Layer 7: Application)

# Packet Structure Example:
Frame 1: 66 bytes on wire (528 bits)
├─ Ethernet II (Layer 2 - Data Link)
│  ├─ Destination: aa:bb:cc:dd:ee:ff (MAC address)
│  ├─ Source: 11:22:33:44:55:66
│  └─ Type: IPv4
├─ Internet Protocol Version 4 (Layer 3 - Network)
│  ├─ Source: 192.168.1.100
│  ├─ Destination: 93.184.216.34
│  ├─ Protocol: TCP
│  └─ TTL: 64
├─ Transmission Control Protocol (Layer 4 - Transport)
│  ├─ Source Port: 52345
│  ├─ Destination Port: 80
│  ├─ Sequence Number: 1234567890
│  ├─ Acknowledgement: 0
│  ├─ Flags: SYN
│  └─ Window Size: 65535
└─ HTTP (Layer 7 - Application)
   └─ [HTTP Request: GET /index.html HTTP/1.1]

# TCP Handshake visible:
1. SYN (client initiates connection)
2. SYN-ACK (server accepts)
3. ACK (client confirms)
4. HTTP GET request sent
```

**Task 3: Filter and Search Packets**

```bash
# Wireshark display filters:

# Show only HTTP traffic
http

# Show only TCP traffic
tcp

# Show traffic from specific IP
ip.src == 192.168.1.100

# Show traffic to specific IP
ip.dst == 8.8.8.8

# Show traffic between two IPs
ip.addr == 192.168.1.100 && ip.addr == 8.8.8.8

# Show HTTPS handshake
ssl.handshake

# Show DNS queries
dns.flags.response == 0

# Show DNS answers
dns.flags.response == 1

# Show all ICMP (ping) traffic
icmp

# Show traffic on specific port
tcp.port == 22

# Show failed connections (RST flag)
tcp.flags.reset == 1

# Command-line filtering with tshark
tshark -r http_traffic.pcap -Y 'http.request.method == "GET"'
tshark -r dns_traffic.pcap -Y 'dns.qry.name contains "google.com"'
```

---

## Part 2: Protocol Analysis & Network Baselines

### 📡 Lab 2: Identify Network Protocols & Anomalies

**Objective:** Recognize normal traffic patterns and detect anomalies.

**Task 1: Analyze Common Protocols**

```bash
# Capture mixed traffic for 30 seconds
sudo tcpdump -i eth0 -w normal_traffic.pcap -G 30 -w - | tshark -i - -a duration:30 -w normal_traffic.pcap

# Analyze protocol distribution in Wireshark:
# Wireshark > Statistics > Protocol Hierarchy

# Expected output on normal network:
# Frame (1000 packets)
# ├─ Ethernet II
# ├─ IPv4 (80% of traffic)
# │  ├─ TCP (60%)
# │  │  ├─ HTTP (20%)
# │  │  ├─ HTTPS (25%)
# │  │  ├─ SSH (5%)
# │  │  └─ Other TCP (10%)
# │  └─ UDP (20%)
# │     ├─ DNS (8%)
# │     ├─ NTP (2%)
# │     └─ Other UDP (10%)
# └─ IPv6 (20%)
```

**Task 2: Create Network Baseline**

```bash
# Capture 1 hour of production traffic
sudo tcpdump -i eth0 -w baseline_prod_traffic.pcap -G 3600

# Analyze with statistics
tshark -r baseline_prod_traffic.pcap -q -z io,phs

# Output:
# Protocol Hierarchy Statistics
# eth             frames:5234 bytes:2345678
#   ip             frames:5100 bytes:2300000
#     tcp          frames:3500 bytes:1900000
#       http       frames:1200 bytes:800000
#       https      frames:1800 bytes:900000
#       ssh        frames:500 bytes:200000
#     udp          frames:1600 bytes:400000
#       dns        frames:800 bytes:100000

# Document baseline metrics:
cat > /tmp/network_baseline.txt << 'EOF'
NETWORK BASELINE (March 28, 2026)

Total Packets: 5,234
Total Bytes: 2.3 MB
Duration: 1 hour

Protocol Distribution:
- TCP: 67% (3,500 packets)
  - HTTP: 34% of TCP
  - HTTPS: 51% of TCP
  - SSH: 14% of TCP
- UDP: 31% (1,600 packets)
  - DNS: 50% of UDP
  - NTP: 5% of UDP
  - Other: 45% of UDP
- ICMP: 2% (100 packets)

Top Destinations:
- 8.8.8.8 (Google DNS): 400 packets
- 93.184.216.34 (Example.com): 350 packets
- 104.18.12.123 (CloudFlare): 250 packets

Normal Behaviors:
- SSH connections: Every 5 min (automated backup)
- DNS queries: Regular (caching)
- HTTP/HTTPS: Constant (web traffic)
- No unusual ports observed
- No fragmented packets
- No ICMP anomalies
EOF
```

**Task 3: Detect Anomalies**

```bash
# Compare current traffic to baseline
sudo tcpdump -i eth0 -w current_traffic.pcap -G 3600

# Analyze for anomalies
tshark -r current_traffic.pcap -q -z compare:/tmp/network_baseline.txt

# Red flags to look for:

# 1. UNUSUAL PORTS
# Wireshark > Statistics > Endpoints
# Look for services on non-standard ports
# e.g., SSH on port 2222, SSH on port 443 (tunneling)

# 2. EXCESSIVE ICMP (possible ping sweep)
tshark -r traffic.pcap -Y 'icmp' | wc -l
# If > 1000 packets/minute = possible network scan

# 3. FRAGMENTED PACKETS (evasion/DoS)
tshark -r traffic.pcap -Y 'ip.flags.mf == 1'
# More fragments flag set = fragmentation

# 4. ZERO-WINDOW PACKETS (possible DoS)
tshark -r traffic.pcap -Y 'tcp.window_size == 0' | wc -l

# 5. UNUSUAL USER AGENTS (malware communication)
tshark -r traffic.pcap -Y 'http.user_agent' -T fields -e http.user_agent | sort | uniq -c
# Look for: python-requests, curl, wget (vs expected: Chrome, Firefox)

# 6. DNS TUNNELING (data exfiltration)
tshark -r traffic.pcap -Y 'dns' -T fields -e dns.qry.name | \
  grep -E '([a-z0-9]){32,}' | head -10
# Names with 32+ random characters = likely tunneling!
```

---

## Part 3: Network Sniffing & ARP Analysis

### 📡 Lab 3: Detect ARP Spoofing & Network Attacks

**Objective:** Identify and prevent network layer attacks.

**Task 1: Capture and Analyze ARP Traffic**

```bash
# Capture ARP packets
sudo tcpdump -i eth0 -n 'arp' -w arp_traffic.pcap

# View ARP packets
sudo tcpdump -i eth0 -n 'arp' -v

# Output:
# ARP, Request who-has 192.168.1.1 tell 192.168.1.100
# ARP, Reply 192.168.1.1 is-at aa:bb:cc:dd:ee:ff

# Normal behavior:
# - ARP requests for gateway/DNS servers
# - ARP replies from legitimate devices
# - Occasional ARP for discovered devices

# Suspicious behavior:
# - Excessive ARP requests (scanning)
# - ARP replies unsolicited (ARP spoofing)
# - Same IP advertised by multiple MACs
```

**Task 2: Detect ARP Spoofing Attack**

```bash
# Simulate ARP spoofing with arpspoof tool
sudo apt-get install -y dsniff

# Attacker's view (redirect traffic through attacker):
sudo arpspoof -i eth0 -t 192.168.1.100 192.168.1.1
# Now 192.168.1.100 thinks attacker is the gateway!

# Defender's detection:
sudo tcpdump -i eth0 -n 'arp' | grep -E '(is-at|who-has)' | tail -20

# Look for:
# 1. Multiple ARP replies for same IP from different MACs
# 2. Frequent ARP gratuitous announcements
# 3. ARP requests from devices should have responses

# Create ARP monitoring script
cat > /usr/local/bin/monitor-arp.sh << 'EOF'
#!/bin/bash

# Monitor for ARP spoofing
sudo tcpdump -i eth0 -n 'arp' -c 100 | \
  awk -F' ' '{print $9, $NF}' | \
  sort | uniq -c | sort -rn | \
  awk '$1 > 3 {print "ALERT: Possible ARP spoofing from " $2}'
EOF

chmod +x /usr/local/bin/monitor-arp.sh
```

**Task 3: Create Network Monitoring Dashboard**

```bash
# Real-time network monitoring
watch -n 1 'ss -antp | grep ESTABLISHED | wc -l'
# Shows number of established connections

# Connections by port
watch -n 1 'ss -antp | grep LISTEN | awk "{print \$4}" | cut -d: -f2 | sort | uniq -c | sort -rn'

# Traffic per interface
watch -n 1 'ifstat -i eth0 -n'

# Create summary script
cat > /usr/local/bin/network-summary.sh << 'EOF'
#!/bin/bash

echo "=== NETWORK STATUS ==="
echo
echo "[CONNECTION SUMMARY]"
ss -antp | grep ESTABLISHED | wc -l
echo "established connections"

echo
echo "[LISTENING SERVICES]"
ss -tulpn | grep LISTEN | awk '{print $4}' | cut -d: -f2 | sort -u

echo
echo "[TOP TALKERS]"
ss -antp | grep ESTABLISHED | awk '{print $5}' | cut -d: -f1 | sort | uniq -c | sort -rn | head -5

echo
echo "[ARP TABLE]"
arp -a | grep -v incomplete
EOF

chmod +x /usr/local/bin/network-summary.sh
./usr/local/bin/network-summary.sh
```

---

## ✅ Completion Checklist

- [ ] Understand OSI model and 7 layers
- [ ] Captured network traffic with tcpdump
- [ ] Analyzed packets in Wireshark
- [ ] Decoded HTTP, DNS, and TCP traffic
- [ ] Created network baseline
- [ ] Identified protocol distribution
- [ ] Detected traffic anomalies
- [ ] Analyzed ARP traffic
- [ ] Created ARP spoofing detection
- [ ] Built network monitoring script
- [ ] Tested all analysis techniques

**Next Week:** Network attacks, Denial of Service, and intrusion detection.
