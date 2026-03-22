# Module 3: Intrusion Detection and Prevention

## Learning Objectives

- Understand IDS vs IPS technologies
- Detect network anomalies and suspicious traffic patterns
- Implement network-based security monitoring
- Respond to intrusion alerts
- Analyze network traffic for threats

## IDS vs IPS

### Intrusion Detection System (IDS)

- **Passive monitoring** - Observes traffic without blocking
- **Detection only** - Identifies threats and alerts
- **Lower overhead** - Non-blocking improves performance
- **False positive handling** - Alerts reviewed by humans

Common IDS Tools:

- Snort (rule-based)
- Suricata (multi-threaded)
- Zeek (network analysis)

### Intrusion Prevention System (IPS)

- **Active blocking** - Automatically stops threats
- **In-line deployment** - Sits between network segments
- **Immediate response** - Blocks malicious traffic in real-time
- **Risk of false positives** - May block legitimate traffic

## Network-Based Detection

### Signature-Based Detection

Detects known attack patterns using rules:

```
alert tcp any any -> any 23 (msg:"Telnet Login Attempt"; flow:to_server,established; content:"|FF|"; offset:0; depth:1; sid:1000001;)
```

### Anomaly-Based Detection

Identifies unusual network behavior:

- Unusual bandwidth usage
- Suspicious port connections
- Protocol violations
- Statistical deviations from baseline

## Common Network Attacks to Monitor

### Port Scanning

```
Multiple SYN packets to closed ports
Detection: IDS alerts on port sweep patterns
```

### DDoS Attacks

```
Flood of packets from multiple sources
Detection: Sudden spike in traffic from specific sources
Mitigation: Rate limiting, traffic filtering
```

### Man-in-the-Middle (MITM)

```
Attacker intercepts communications between two parties
Detection: ARP spoofing alerts, SSL certificate warnings
Prevention: HTTPS, VPN, certificate pinning
```

### Brute Force Attacks

```
Repeated login attempts with different credentials
Detection: Multiple failed login attempts from same IP
Response: Account lockout, rate limiting, CAPTCHA
```

## IDS Alert Analysis Workflow

1. **Alert Generated** - IDS detects suspicious activity
2. **Log Collection** - Full packet capture and metadata
3. **Investigation** - Analyze source, destination, payload
4. **Correlation** - Link related alerts for attack patterns
5. **Response** - Document incident, take containment actions

## Real-World Scenario: DDoS Attack Detection

**Scenario**: Web server receives 100,000 requests/second from 10,000 different IPs

**IDS Detection**:

```
Multiple alerts for THRESHOLD_EXCEEDED
Source IPs from botnet
Destination: Web server port 80
Traffic pattern: Consistent UDP/SYN floods
```

**Response**:

1. Enable DDoS mitigation rules in IPS
2. Rate limit connections from suspicious sources
3. Engage ISP for upstream filtering
4. Redirect traffic through DDoS mitigation service
5. Monitor legitimate traffic restoration

## Network Monitoring Tools

### tcpdump - Packet Capture

```bash
# Capture traffic on eth0
sudo tcpdump -i eth0

# Capture to file
sudo tcpdump -i eth0 -w capture.pcap

# Filter for specific port
sudo tcpdump -i eth0 port 443

# Read pcap file
tcpdump -r capture.pcap
```

### Snort Rules Tuning

```bash
# Run Snort in IDS mode
sudo snort -d -h 192.168.1.0/24 -r capture.pcap -c /etc/snort/snort.conf

# Run Snort in packet logger mode
sudo snort -l ./logs -n 100 -i eth0
```

## Alert Tuning and False Positives

### Reducing False Positives

1. Whitelist known-good traffic
2. Tune detection thresholds
3. Use multiple detection methods
4. Correlate alerts across tools
5. Update rules regularly

### Alert Priority Levels

- **Critical**: Confirmed attacks, immediate action needed
- **High**: Suspicious activity, requires investigation
- **Medium**: Policy violations, monitor closely
- **Low**: Informational alerts, routine monitoring

## Quick Check

1. An IDS blocks malicious traffic automatically. **(False - IDS only detects)**
2. Signature-based detection requires rules for known attacks. **(True)**
3. Anomaly detection can identify zero-day exploits. **(True - unknown attacks)**

## Summary

Network-based intrusion detection and prevention provide critical visibility into network security. Effective monitoring combines signature-based and anomaly-based detection with proper alert tuning and incident response procedures.
