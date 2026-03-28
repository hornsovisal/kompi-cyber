# Week 7: Incident Response Capstone Project

## 🎯 Learning Outcomes

By the end of this week, you will:

- Investigate a compromised system using forensic techniques
- Identify the attack timeline and attacker's actions
- Determine the initial vulnerability exploited
- Perform evidence collection and chain of custody
- Write a professional incident response report
- Present findings to stakeholders

---

## 📚 Module Overview

| Aspect                  | Details                                                   |
| ----------------------- | --------------------------------------------------------- |
| **Duration**            | 1 week                                                    |
| **Project Type**        | Capstone - Comprehensive incident response                |
| **Deliverables**        | Report, timeline, recommendations                         |
| **Cybersecurity Focus** | Forensic Analysis, Incident Response, Root Cause Analysis |

---

## Part 1: The Incident Scenario

### 🚨 Your Mission

**You are a SOC analyst investigating a security breach at a financial services company.**

**Incident Overview:**

- **Timeline:** March 28, 2026, 02:15 AM - Discovery of unauthorized access
- **Scope:** Web server (192.168.1.100) running Apache and MySQL
- **Symptoms:**
  - Web server consuming 100% CPU
  - Network traffic spike (1 GB/hour outbound)
  - New user "backup_admin" created in database
  - Customer data (100k records) may be exposed

**Your job:** Investigate and determine:

1. How did the attacker get in?
2. What did they do?
3. What data was compromised?
4. How do we prevent this in the future?

---

## Part 2: Evidence Collection & Analysis

### 🔍 Lab: Forensic Investigation

**Evidence Provided:**

1. Apache access logs (`/var/log/apache2/access.log`)
2. System authentication logs (`/var/log/auth.log`)
3. Database audit logs
4. Network traffic capture (`.pcap` file)

### 📋 Task 1: Analyze Web Server Logs

**Sample Apache Access Log:**

```
192.168.1.50 - - [28/Mar/2026:01:45:32 +0000] "GET /login.php HTTP/1.1" 200 1234
203.0.113.45 - - [28/Mar/2026:01:50:12 +0000] "POST /admin/login.php HTTP/1.1" 302 0
203.0.113.45 - - [28/Mar/2026:01:50:13 +0000] "POST /admin/login.php HTTP/1.1" 302 0
203.0.113.45 - - [28/Mar/2026:01:50:14 +0000] "POST /admin/login.php HTTP/1.1" 302 0
203.0.113.45 - - [28/Mar/2026:01:50:15 +0000] "POST /admin/login.php HTTP/1.1" 302 0
203.0.113.45 - - [28/Mar/2026:02:00:45 +0000] "GET /admin/dashboard.php HTTP/1.1" 200 5000
203.0.113.45 - - [28/Mar/2026:02:05:30 +0000] "GET /api/customers/export?format=csv HTTP/1.1" 200 51234
203.0.113.45 - - [28/Mar/2026:02:05:31 +0000] "GET /api/customers/export?format=csv HTTP/1.1" 200 51234
203.0.113.45 - - [28/Mar/2026:02:05:32 +0000] "GET /api/customers/export?format=csv HTTP/1.1" 200 51234
```

**Analysis:**

| Finding                | Indicator                                         | Severity |
| ---------------------- | ------------------------------------------------- | -------- |
| **Brute Force Attack** | Multiple 302 status codes from same IP in seconds | HIGH     |
| **Successful Login**   | 203.0.113.45 → admin dashboard 200 response       | HIGH     |
| **Data Exfiltration**  | /api/customers/export called 3x (51MB data)       | CRITICAL |
| **External IP**        | 203.0.113.45 (not internal 192.168 range)         | HIGH     |

**Questions to Answer:**

1. When did the attack start? → 01:50:12 (brute force began)
2. When did they gain access? → 02:00:45 (successful admin login)
3. When did they steal data? → 02:05:30-02:05:32 (customer export)
4. Who is the attacker? → IP 203.0.113.45 (external, likely attacker's machine or proxy)

**Follow-up Investigation:**

```bash
# Get all requests from the attacker's IP
grep '203.0.113.45' /var/log/apache2/access.log | wc -l
# Result: 47 requests from attacker

# Get unique endpoints accessed
grep '203.0.113.45' /var/log/apache2/access.log | awk '{print $7}' | sort | uniq
# Results:
# /admin/login.php (brute force)
# /admin/dashboard.php (admin panel)
# /api/customers/export (data exfiltration)
# /api/users/create (created rogue account)
# /config.php (config file access)
```

### 📋 Task 2: Analyze System Logs for New Accounts

**Sample Auth Log:**

```
Mar 28 02:00:45 webserver useradd[12345]: new user: name=backup_admin, UID=1001, GID=1001, home=/home/backup_admin, shell=/bin/bash
Mar 28 02:01:12 webserver sudo: backup_admin : TTY=unknown ; PWD=/home/backup_admin ; USER=root ; COMMAND=/bin/bash
Mar 28 02:05:30 webserver sudo: backup_admin : TTY=unknown ; PWD=/var/www/html ; USER=root ; COMMAND=/usr/bin/mysqldump -u root -p[PASSWORD] all_customers > /tmp/export.csv
```

**Findings:**

1. **Backdoor Account Created:** `backup_admin` (suspicious name, created during attack)
2. **Privilege Escalation:** backup_admin used sudo to run commands as root
3. **Database Dump:** Attacker dumped entire customer database to /tmp/export.csv

### 📋 Task 3: Analyze Network Traffic (Wireshark)

**Observations from `.pcap` file:**

```
# External IP 203.0.113.45 connected to:
203.0.113.45 → 192.168.1.100:443 (HTTPS - encrypted, but can see destination)
203.0.113.45 → 192.168.1.100:3306 (MySQL database direct access!!!)
203.0.113.45 → 68.119.124.15:443 (Unknown external server - data exfiltration)
```

**Red Flags:**

- ❌ **MySQL exposed to Internet!** Port 3306 should never be accessible from outside
- Direct database access without going through web application
- Data being sent to external server (68.119.124.15) - likely attacker's collection point

---

## Part 3: Root Cause Analysis

### 🔎 The Attack Timeline

```
01:30 AM  -  Attacker begins reconnaissance
          └─ Tests /admin/login.php endpoint

01:45 AM  -  Brute force attack starts
          └─ Tries common passwords: admin/admin, admin/123456, etc.

02:00:45 AM - SUCCESSFUL LOGIN
          └─ Credentials: admin / Password123
          └─ Root cause: Weak default password never changed!

02:01:12 AM - Privilege escalation
          └─ Created backup_admin account with sudo access
          └─ Persistence mechanism (maintains access)

02:05:30 AM - DATA EXFILTRATION
          └─ Dumped customer database (100,000 records)
          └─ Transferred to external C2 server

02:15 AM    - DETECTION
          └─ CPU spike detected (mysqldump consuming resources)
          └─ Alert triggered
```

### 🎯 Root Causes Identified

| Vulnerability                    | Contributing Factor                           | Severity |
| -------------------------------- | --------------------------------------------- | -------- |
| **Weak Default Credentials**     | Admin password never changed from default     | CRITICAL |
| **No Rate Limiting**             | Brute force attack allowed unlimited attempts | HIGH     |
| **Database Exposed to Internet** | MySQL port 3306 accessible publicly           | CRITICAL |
| **No MFA**                       | Single password was only authentication       | HIGH     |
| **No Firewall Rules**            | No network segmentation                       | HIGH     |
| **No Intrusion Detection**       | Brute force not detected immediately          | MEDIUM   |
| **No Database Encryption**       | Customer data in plaintext                    | HIGH     |
| **No Audit Logging**             | Large data dumps not flagged as suspicious    | MEDIUM   |

---

## Part 4: Professional Incident Report

### 📝 Template: Comprehensive Incident Response Report

```
╔════════════════════════════════════════════════════════════╗
║           INCIDENT RESPONSE & FORENSIC ANALYSIS REPORT     ║
║                                                            ║
║ Incident ID: INC-2026-0328-001                             ║
║ Date: March 28, 2026                                       ║
║ Analyst: [Your Name]                                       ║
║ Classification: CONFIDENTIAL                               ║
╚════════════════════════════════════════════════════════════╝

1. EXECUTIVE SUMMARY
   ────────────────────────────────────────────────────────────────

   A successful cyber attack resulted in the compromise of customer
   data affecting approximately 100,000 records. The attack originated
   from external IP 203.0.113.45 on March 28, 2026, at 01:50 AM.

   ROOT CAUSE: Default admin credentials were never changed.
   IMPACT: Customer PII exposed, financial and reputational damage
   SEVERITY: CRITICAL


2. INCIDENT TIMELINE
   ────────────────────────────────────────────────────────────────

   01:50:12 - Brute force attack initiates against /admin/login.php
   02:00:45 - Attacker gains admin access (weak credentials)
   02:01:12 - Backdoor account 'backup_admin' created
   02:05:30 - Customer database exported and exfiltrated
   02:15:00 - Anomalous CPU usage detected, incident triggered
   02:30:00 - SOC team alerted and investigation begins
   03:00:00 - Web server taken offline for forensics
   03:15:00 - Database credentials rotated, backdoor removed


3. EVIDENCE COLLECTED
   ────────────────────────────────────────────────────────────────

   A. Apache Access Logs
      - 47 requests from attacker IP
      - Clear brute force pattern (identical requests in seconds)
      - Successful admin login recorded
      - Large data export requests (51 MB each)

   B. System Authentication Logs
      - New user 'backup_admin' creation timestamp
      - Sudo commands executed as root
      - Database dump command captured

   C. Network Traffic (PCAP)
      - Unencrypted MySQL traffic visible
      - Connection to external server 68.119.124.15
      - Data exfiltration confirmed

   D. Database Audit Logs
      - SELECT * FROM customers executed
      - No WHERE clause (returned all 100k records)


4. VULNERABILITIES EXPLOITED
   ────────────────────────────────────────────────────────────────

   Primary Vulnerability: Default/Weak Credentials
   └─ Admin account password never changed from default
   └─ Default: admin / Password123
   └─ Impact: Complete application compromise
   └─ CVSS Score: 9.8 (Critical)

   Secondary Vulnerabilities:
   └─ No rate limiting on login attempts
   └─ MySQL database exposed to internet (port 3306)
   └─ No multi-factor authentication
   └─ No network segmentation/firewall rules
   └─ Database credentials hardcoded in application
   └─ No data encryption at rest
   └─ No real-time alerting on large data exports


5. IMPACT ASSESSMENT
   ────────────────────────────────────────────────────────────────

   Data Compromised:
   └─ Customer Names: 100,000 records
   └─ Email Addresses: 100,000 records
   └─ Phone Numbers: 100,000 records
   └─ Account Balances: 100,000 records
   └─ Social Security Numbers: 50,000 records (sensitive)

   Estimated Damage:
   └─ Regulatory Fines (GDPR, CCPA): $50-500 million
   └─ Customer Notification Costs: $200-500k
   └─ Reputational Damage: Immeasurable
   └─ Business Interruption: 2 hours of downtime


6. CONTAINMENT & REMEDIATION ACTIONS TAKEN
   ────────────────────────────────────────────────────────────────

   Immediate Actions (Completed):
   ✅ Web server taken offline
   ✅ Backdoor account 'backup_admin' deleted
   ✅ All database credentials rotated
   ✅ Apache access logs secured for evidence
   ✅ External IP 203.0.113.45 blocked at firewall
   ✅ MySQL port 3306 no longer exposed to internet

   Short-term Fixes (Next 24-48 hours):
   ⏳ Patch web application authentication
   ⏳ Implement rate limiting on login endpoints
   ⏳ Enable multi-factor authentication (MFA)
   ⏳ Reset all admin credentials
   ⏳ Database encryption enabled
   ⏳ Network segmentation implemented (DB not internet-facing)

   Long-term Improvements (30-90 days):
   ⏳ SIEM implementation for real-time monitoring
   ⏳ Intrusion Detection System (IDS) deployment
   ⏳ Security awareness training for IT staff
   ⏳ Penetration testing (quarterly)
   ⏳ Incident response plan update + testing


7. RECOMMENDATIONS
   ────────────────────────────────────────────────────────────────

   Security Controls Required (Priority Order):

   1. CRITICAL: Change all default credentials
      └─ Every application, database, device
      └─ Use strong (12+ char) unique passwords
      └─ Deadline: 24 hours

   2. CRITICAL: Limit database access
      └─ MySQL should NOT be internet-facing
      └─ Use firewall rules to restrict to app servers only
      └─ Deadline: 48 hours

   3. HIGH: Implement MFA
      └─ All admin accounts require MFA
      └─ Use TOTP or hardware tokens
      └─ Deadline: 1 week

   4. HIGH: Enable logging and alerting
      └─ CloudWatch / SIEM for real-time monitoring
      └─ Alert on: brute force attempts, large data exports
      └─ Deadline: 2 weeks

   5. MEDIUM: Penetration testing
      └─ Hire external security firm
      └─ Full application security assessment
      └─ Deadline: 30 days

   6. ONGOING: Security awareness training
      └─ Staff should not use default credentials
      └─ Phishing email training
      └─ Incident response drills quarterly


8. LESSONS LEARNED
   ────────────────────────────────────────────────────────────────

   What Went Wrong:
   ✗ Default credentials assumption ("someone will change it")
   ✗ No network segmentation
   ✗ Reactive security (detected only after CPU spike)

   What Went Right:
   ✓ Monitoring caught the anomaly
   ✓ Fast response team activation
   ✓ Good forensic logs available

   Preventive Measures:
   • Automated credential rotation
   • Zero-trust network architecture
   • Proactive threat hunting
   • Security scanning in CI/CD pipeline


9. CONCLUSION
   ────────────────────────────────────────────────────────────────

   This incident was preventable through basic security hygiene:
   changing default credentials and not exposing databases publicly.

   While the impact was significant, the organization now has an
   opportunity to dramatically improve its security posture through
   the recommended measures.

   Status: Investigation Complete ✓
   Next Review: 30 days post-incident


10. APPENDIX - Technical Details
    ────────────────────────────────────────────────────────────────

    Attacker IP: 203.0.113.45
    Reverse DNS: Not available (likely proxy/VPN)
    Geolocation: Eastern Europe (based on IP intelligence)

    Compromised User: admin
    Backdoor Account: backup_admin (UID 1001)

    Data Exfiltration Destination: 68.119.124.15:443
    (Registered in Russia, likely attacker infrastructure)

    Hash of Exported File:
    SHA256: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0
```

---

## ✅ Completion Checklist

- [ ] Analyzed Apache access logs to identify brute force attack
- [ ] Extracted attacker's IP and timeline
- [ ] Identified successful login and privilege escalation
- [ ] Found evidence of data exfiltration
- [ ] Analyzed system logs for backdoor account creation
- [ ] Examined network traffic for database exposure
- [ ] Created comprehensive incident timeline
- [ ] Identified root causes (default credentials, exposed database)
- [ ] Documented all vulnerabilities exploited
- [ ] Wrote professional incident response report
- [ ] Provided remediation recommendations
- [ ] Presented findings in a clear, organized manner

---

## 🏆 Summary: 7-Week Journey

**You've completed:**

- Week 1: SOC operations and network reconnaissance
- Week 2: Threat analysis and network forensics
- Week 3: Security principles (CIA Triad)
- Week 4: Identity and access management
- Week 5: Malware analysis
- Week 6: Cloud security
- Week 7: Comprehensive incident response

**You can now:**
✓ Investigate security incidents from start to finish
✓ Identify vulnerabilities in systems and networks
✓ Understand attacker methodologies
✓ Recommend and implement security controls
✓ Write professional security reports

**Next Steps:**

- Pursue advanced certifications (Security+, CISSP)
- Join a Security Operations Center (SOC)
- Conduct penetration testing
- Perform threat hunting
- Build your cybersecurity career! 🚀
