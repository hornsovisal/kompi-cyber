# Week 2: Analyzing Common Cyber Threats

## 🎯 Learning Outcomes

By the end of this week, you will:

- Analyze phishing emails to identify spoofing indicators
- Inspect network traffic using Wireshark to detect suspicious activity
- Classify different types of cyber attacks (DoS, MitM, Malware)
- Perform a forensic analysis of a simulated attack
- Write professional incident findings

---

## 📚 Module Overview

| Aspect                  | Details                                                    |
| ----------------------- | ---------------------------------------------------------- |
| **Duration**            | 1 week                                                     |
| **Practical Labs**      | 3 hands-on labs                                            |
| **Tools**               | Wireshark, Email Client, Text Editor                       |
| **Cybersecurity Focus** | Attack Detection, Forensic Analysis, Threat Classification |

---

## Part 1: Understanding Common Attack Types

### 🎯 Attack Taxonomy

| Attack Type                  | Mechanism                                | Impact                  | Example                        |
| ---------------------------- | ---------------------------------------- | ----------------------- | ------------------------------ |
| **Phishing**                 | Social engineering via email             | Credential theft        | "Confirm your Amazon password" |
| **SQL Injection**            | Malformed database query                 | Data theft/manipulation | `' OR '1'='1` in login form    |
| **Denial of Service (DoS)**  | Overwhelming system with traffic         | Service unavailability  | 1 million requests per second  |
| **Man-in-the-Middle (MitM)** | Intercepting traffic between two parties | Credential/data theft   | Attacker on same WiFi network  |
| **Ransomware**               | Encrypting files and demanding payment   | Data/business loss      | WannaCry, NotPetya             |
| **Brute Force**              | Guessing passwords/keys repeatedly       | Account compromise      | Trying 10,000 passwords        |

---

## Part 2: Phishing Email Analysis

### 🔍 Lab 1: Detecting Email Spoofing

**Objective:** Identify red flags in a phishing email by analyzing headers and content.

**Why This Matters:** Phishing is the #1 attack vector. 90% of breaches start with a phishing email.

### 📋 Sample Phishing Email (Raw Format)

```
From: "Amazon Support" <amazon-security@amaz0n-alert.phishing-domain.ru>
To: victim@company.com
Subject: [URGENT] Verify Your Account Immediately
Date: Fri, 28 Mar 2026 14:32:15 +0000
Message-ID: <123456789@fake-server.ru>

Dear Valued Customer,

We have detected unusual activity on your Amazon account.
To verify your identity and secure your account, please click the link below:

https://amaz0n-alert.phishing-domain.ru/verify?account=victim@company.com&token=abc123

Click here to verify your account.

Regards,
Amazon Customer Support
```

### 🔎 Analysis Tasks

**Task 1: Analyze the Header**

Question 1: What is the sender's actual email domain?

- **Answer:** `amaz0n-alert.phishing-domain.ru`
- **Red Flag:** Uses "0" (zero) instead of "o" to mimic Amazon's domain. Real Amazon uses `@amazon.com`

Question 2: Is the domain registered to Amazon?

- **Answer:** No. A quick WHOIS lookup shows it's registered to an attacker in Russia.
- **Tool:** https://www.whois.com or `whois amazon-alert.phishing-domain.ru`

**Task 2: Analyze the Content**

| Element           | Analysis                                     | Red Flag?                                           |
| ----------------- | -------------------------------------------- | --------------------------------------------------- |
| **Greeting**      | Generic "Dear Customer" (not personalized)   | ✅ Yes - Real Amazon addresses you by name          |
| **Urgency**       | "[URGENT] Verify immediately"                | ✅ Yes - Creates pressure to click without thinking |
| **Link**          | Points to phishing-domain.ru, not amazon.com | ✅ Yes - Domain mismatch                            |
| **Logo/Branding** | ASCII text, no official Amazon logo          | ✅ Yes - Lacks professional formatting              |
| **Grammar**       | Generally correct but slightly formal        | ⚠️ Possible - Good phishers use proper grammar      |

**Task 3: Trace the IP Address**

```bash
nslookup amaz0n-alert.phishing-domain.ru
```

**Expected Output:**

```
Server: 8.8.8.8
Address: 8.8.8.8#53

Non-authoritative answer:
Name: amaz0n-alert.phishing-domain.ru
Address: 203.0.113.42  # This is a fake/example IP
```

**Analysis:** Use a tool like **VirusTotal** (https://www.virustotal.com) or **IP reputation database** to check if this IP is known for hosting phishing/malware.

### 📝 Task 4: Write Phishing Analysis Report

**Report Template:**

```
PHISHING EMAIL ANALYSIS
Date: March 28, 2026
Analyst: [Your Name]
Email From: amazon-security@amaz0n-alert.phishing-domain.ru
Subject: [URGENT] Verify Your Account Immediately

FINDINGS:
1. Domain Spoofing: Sender uses "amaz0n" (with zero) instead of "amazon"
2. Urgency Tactics: "URGENT" and "immediately" create pressure to click
3. Generic Greeting: No personalization (real Amazon uses customer name)
4. Malicious Link: Points to phishing-domain.ru instead of amazon.com
5. Missing Branding: No official Amazon logo or formatting

RECOMMENDATION: This is a HIGH-CONFIDENCE PHISHING email.

ACTIONS:
- Delete the email
- Do NOT click the link
- Do NOT enter credentials
- Report to IT security team
- If credentials were entered, change password immediately
```

---

## Part 3: Network Traffic Analysis

### 🔍 Lab 2: Detecting Suspicious Network Activity with Wireshark

**Objective:** Use Wireshark to capture and analyze network traffic, identifying suspicious patterns.

**Why This Matters:** Attackers often exfiltrate data over the network. Network analysis is critical for detection.

### 📋 Setup

1. **Open Wireshark** (pre-installed on Kali)
2. **Select your network interface** (usually eth0 or wlan0)
3. **Start capturing** packets

### 🔎 Lab Tasks

**Task 1: Capture HTTP Traffic (Unencrypted)**

```bash
# In Wireshark, filter for HTTP only
http
```

**What You'll See:**

- GET requests to websites
- Hostnames (SNI - Server Name Indication)
- Request methods (GET, POST, etc.)

**Security Implication:** HTTP is unencrypted. An attacker on the same network (WiFi) can see:

- Websites you're visiting
- Form data (if not HTTPS)
- Cookies (potentially)

**Task 2: Identify Data Exfiltration**

```bash
# Filter for large outbound traffic to unknown IPs
ip.dst != 192.168.1.0/24 && frame.len > 1000
```

**What You're Looking For:**

- Large file transfers to external IPs
- Unusual ports (not 80, 443, 22)
- Multiple connections to the same external IP

**Red Flags:**

- Employee sending 5 GB of files to an external IP at 3 AM
- Traffic to a known C2 (Command & Control) server
- Encoded/compressed traffic to unknown destination

**Task 3: Detect Suspicious DNS Queries**

DNS is critical - it's how adversaries communicate with malware.

```bash
# Filter for DNS traffic
dns
```

**What to Look For:**

- Queries to suspicious domains (length > 50 characters)
- Rapid DNS queries (possible data exfiltration via DNS tunnel)
- Queries to domains with misspelled names of legitimate services

**Example (Bad DNS Activity):**

```
192.168.1.105 -> 8.8.8.8:53  Query for "malicious-c2-server-1a2b3c4d5e6f.ru"
192.168.1.105 -> 8.8.8.8:53  Query for "malicious-c2-server-1a2b3c4d5e6g.ru"
192.168.1.105 -> 8.8.8.8:53  Query for "malicious-c2-server-1a2b3c4d5e6h.ru"
(Multiple queries with slight variations = possible malware beaconing)
```

**Task 4: Follow a TCP Stream**

Right-click on a packet → "Follow TCP Stream"

This reconstructs the conversation between client and server.

**Example Investigation:**

```
# A user visits a website
GET /products HTTP/1.1
Host: shopping-site.com
Cookie: session=abc123def456

# What the attacker can see:
- The website being visited
- The session cookie (potentially reusable)
- Search queries or data entered
```

---

## Part 4: Malware Classification

### 📊 Types of Malware You'll Encounter

| Malware Type   | Behavior                                          | Detection                             |
| -------------- | ------------------------------------------------- | ------------------------------------- |
| **Trojan**     | Appears legitimate but contains malicious payload | Antivirus, behavior analysis          |
| **Worm**       | Self-replicating, spreads via network             | Monitor network for unusual traffic   |
| **Ransomware** | Encrypts files, demands payment                   | File integrity monitoring, backup     |
| **Botnet**     | Infected machine controlled remotely              | Monitor for C2 communication          |
| **Spyware**    | Spies on user activity                            | Network traffic analysis, EDR         |
| **Rootkit**    | Hides malicious activity                          | Behavioral analysis, integrity checks |

---

## 🧠 Common Mistakes & How to Avoid Them

❌ **Mistake:** Clicking links in suspicious emails
✅ **Fix:** Always hover over links to see the actual URL before clicking

❌ **Mistake:** Assuming HTTPS means safe
✅ **Fix:** HTTPS only encrypts in transit. Content itself can still be malicious

❌ **Mistake:** Ignoring network traffic anomalies
✅ **Fix:** Unusual traffic patterns = red flag. Investigate immediately.

---

## ✅ Completion Checklist

- [ ] Analyzed phishing email and identified at least 5 red flags
- [ ] Created phishing analysis report
- [ ] Captured network traffic in Wireshark
- [ ] Filtered for HTTP, DNS, and other protocols
- [ ] Followed a TCP stream successfully
- [ ] Identified suspicious network patterns
- [ ] Understood different malware types and their characteristics

**Next Week:** Apply the CIA Triad to real-world security scenarios and understand security design principles.
