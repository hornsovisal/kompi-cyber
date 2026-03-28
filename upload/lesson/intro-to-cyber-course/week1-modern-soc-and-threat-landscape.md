# Week 1: The Modern SOC & Cyber Threat Landscape

## 🎯 Learning Outcomes

By the end of this week, you will:

- Understand the role of a Security Operations Center (SOC) and analyst tiers
- Set up a virtual lab environment for security analysis
- Perform basic network reconnaissance using industry-standard tools
- Analyze findings and report on potential vulnerabilities

---

## 📚 Module Overview

| Aspect                  | Details                                      |
| ----------------------- | -------------------------------------------- |
| **Duration**            | 1 week                                       |
| **Practical Labs**      | 2 hands-on labs                              |
| **Tools**               | VirtualBox, Kali Linux, nmap, Wireshark      |
| **Cybersecurity Focus** | Situational Awareness, Threat Identification |

---

## Part 1: The Role of a SOC Analyst

### What is a SOC?

A **Security Operations Center (SOC)** is a team of security professionals that monitors networks and systems 24/7 to detect and respond to security incidents.

**SOC Analyst Tiers:**

| Tier                            | Role              | Responsibilities                                                  |
| ------------------------------- | ----------------- | ----------------------------------------------------------------- |
| **Tier 1 (Alert Analyst)**      | First responder   | Monitor alerts, triage incidents, create tickets                  |
| **Tier 2 (Incident Responder)** | Investigation     | Investigate alerts, gather evidence, escalate if needed           |
| **Tier 3 (Threat Hunter)**      | Proactive defense | Hunt for advanced threats, reverse malware, patch vulnerabilities |

### Day in the Life of a Tier 1 Analyst

- 9:00 AM: Review overnight alerts from the SIEM (Security Information and Event Management system)
- 9:30 AM: Investigate a "brute force login attempt" alert
- 10:15 AM: Create incident ticket and escalate to Tier 2
- 10:30 AM: Monitor outbound traffic for data exfiltration
- 12:00 PM: Lunch break
- 1:00 PM: Review firewall logs for new suspicious IPs
- 3:00 PM: Attend team meeting on a recent phishing campaign
- 4:00 PM: Generate daily incident report

**💡 Key Skill:** Staying calm, methodical, and curious under pressure.

---

## Part 2: Setting Up Your Lab Environment

### 🔧 Lab 1: Building a Virtual Lab for Security Analysis

**Objective:** Set up a safe, isolated environment for security testing without risking production systems.

**Prerequisites:**

- VirtualBox (free) or VMware
- At least 8 GB RAM available
- ~50 GB disk space

**Setup Steps:**

1. **Download Required ISOs:**
   - Kali Linux: https://www.kali.org/downloads/
   - Metasploitable 2: https://sourceforge.net/projects/metasploitable/files/

2. **Create Virtual Machines:**
   - Create a new VM with 2 CPU cores, 2 GB RAM, and a 20 GB virtual disk for Kali
   - Create another VM with 4 GB RAM and a 10 GB disk for Metasploitable 2

3. **Configure Network:**
   - Set both VMs to the same virtual network (Internal Network or Host-Only)
   - Verify Kali can ping Metasploitable:
     ```bash
     ping <metasploitable-ip>
     ```

4. **Verify Tools:**
   - Open a terminal in Kali
   - Run: `nmap --version`, `wireshark --version`

**Expected Output:**

```
Kali Linux vm started successfully
Network configured: 192.168.1.X subnet
nmap version 7.92
Wireshark 4.0.0
```

---

## Part 3: Network Reconnaissance with nmap

### 🔍 Lab 2: Identifying Services and Open Ports

**Objective:** Use nmap to discover what services are running on a target system.

**Why This Matters:** Attackers perform the same reconnaissance before attacking. As a defender, you need to understand what an attacker can see.

### 📋 Tasks

**Task 1: Basic Network Scan**

```bash
nmap <metasploitable-ip>
```

**Example Output:**

```
Starting Nmap at Fri Mar 28 14:23:01 2026
Nmap scan report for 192.168.1.135
Host is up (0.00044s latency).
Not shown: 988 closed ports
PORT      STATE SERVICE
21/tcp    open  ftp
22/tcp    open  ssh
23/tcp    open  telnet
25/tcp    open  smtp
53/tcp    open  domain
80/tcp    open  http
111/tcp   open  rpcbind
139/tcp   open  netbios-ssn
445/tcp   open  microsoft-ds
512/tcp   open  exec
513/tcp   open  login
514/tcp   open  shell
```

**Analysis Questions:**

1. How many services are running?
2. Which services are clearly insecure (deprecated protocols like telnet)?
3. What do you think is running on port 80 (HTTP)?

**Task 2: Detailed Service Version Detection**

```bash
nmap -sV <metasploitable-ip>
```

This shows the software version running on each service. Why is this important? **Because older versions have known vulnerabilities.**

**Example Output:**

```
21/tcp    open  ftp        vsftpd 2.3.4
22/tcp    open  ssh        OpenSSH 4.7p1
80/tcp    open  http       Apache httpd 2.2.8
```

**Analysis Questions:**

1. Look up CVE for "vsftpd 2.3.4" - does a vulnerability exist?
2. Is Apache 2.2.8 outdated? (Current version is 2.4.x)

**Task 3: OS Detection**

```bash
nmap -O <metasploitable-ip>
```

This probes the target system to guess its operating system.

**Expected Output:** The scan identifies the OS as Linux (Ubuntu/Debian).

---

## Part 4: Analysis & Reporting

### 📊 Mini Assignment: Network Reconnaissance Report

**Write a 1-page report containing:**

1. **Executive Summary** (2-3 sentences)
   - What is the target system?
   - How many services are running?
   - Initial risk assessment (High/Medium/Low)

2. **Findings**
   - List all open ports and their services
   - Identify any deprecated or insecure services (telnet, ftp, rlogin)
   - Highlight services that are likely vulnerable

3. **Recommendations**
   - Which services should be disabled?
   - Which require patching?
   - What additional hardening is needed?

**Example Report Template:**

```
NETWORK RECONNAISSANCE REPORT
Target: 192.168.1.135 (Metasploitable 2)
Date: March 28, 2026
Analyst: [Your Name]

EXECUTIVE SUMMARY
The target system is running Metasploitable 2, a deliberately vulnerable Linux
system with 13 open ports. Multiple critically outdated services are deployed,
including FTP, Telnet, and Apache 2.2.8. Risk Level: HIGH.

FINDINGS
- 21/tcp (FTP, vsftpd 2.3.4): Vulnerable to remote code execution
- 23/tcp (Telnet): Deprecated, credentials transmitted in cleartext
- 80/tcp (HTTP, Apache 2.2.8): Likely vulnerable to multiple exploits
- 139/tcp, 445/tcp (SMB): Windows resource sharing; weak authentication

RECOMMENDATIONS
1. Disable FTP, Telnet, and other deprecated protocols
2. Patch Apache to version 2.4.x
3. Enable SSH key-based authentication only
4. Configure firewall rules to restrict access to essential services
5. Implement intrusion detection system (IDS) monitoring
```

---

## 🎓 Key Concepts

| Concept                 | Definition                                            |
| ----------------------- | ----------------------------------------------------- |
| **Reconnaissance**      | Gathering information about a target before attacking |
| **Service Enumeration** | Identifying running services and versions             |
| **Vulnerability**       | A weakness that can be exploited                      |
| **Patch Management**    | Keeping software updated to fix known vulnerabilities |

---

## 🧠 Common Mistakes & How to Avoid Them

❌ **Mistake:** Scanning production systems without permission
✅ **Fix:** Always use an isolated lab environment first

❌ **Mistake:** Ignoring old service versions ("It still works")
✅ **Fix:** Outdated = vulnerable. Patch immediately.

❌ **Mistake:** Allowing all ports/services to run
✅ **Fix:** "Principle of Least Privilege" - disable what you don't need

---

## 📚 Further Reading

- **NIST Cybersecurity Framework:** https://www.nist.gov/cyberframework
- **CIS Top 20 Critical Security Controls:** https://www.cisecurity.org/cis-controls
- **Metasploit Framework:** https://www.metasploit.com/ (for advanced exploitation)

---

## ✅ Completion Checklist

- [ ] Virtual lab environment created and tested
- [ ] Kali Linux VM successfully pings Metasploitable VM
- [ ] nmap basic scan completed
- [ ] Service version detection completed
- [ ] Network Reconnaissance Report written
- [ ] Identified at least 3 potential vulnerabilities
- [ ] Understood SOC analyst roles and daily activities

**Next Week:** Analyzing real cyber threats and understanding attack methodologies.
