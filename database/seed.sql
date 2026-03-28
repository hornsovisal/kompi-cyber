-- MySQL dump for Kompi-Cyber with updated 17-week curriculum
-- Database: kompiCyber
-- Generated: 2026-03-28

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, UNIQUE_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;

-- Clear existing data
TRUNCATE TABLE quiz_answers;
TRUNCATE TABLE exercise_submissions;
TRUNCATE TABLE exercise_test_cases;
TRUNCATE TABLE exercises;
TRUNCATE TABLE quiz_attempts;
TRUNCATE TABLE quiz_questions;
TRUNCATE TABLE quiz_options;
TRUNCATE TABLE lesson_progress;
TRUNCATE TABLE certificates;
TRUNCATE TABLE enrollments;
TRUNCATE TABLE lessons;
TRUNCATE TABLE modules;
TRUNCATE TABLE courses;
TRUNCATE TABLE domains;
TRUNCATE TABLE users;
TRUNCATE TABLE roles;

-- Insert Roles
INSERT INTO roles (id, name) VALUES
(1, 'student'),
(2, 'instructor'),
(3, 'admin');

-- Insert Users
INSERT INTO users (id, full_name, email, password_hash, role_id, is_active, created_at) VALUES
('cd54116a-1b95-11f1-a2a0-853fa890d88b', 'Admin User', 'admin@cybernext.local', '$2a$10$7EqJtq98hPqEX7fNZaFWoOHi6M9M0Wn4R7iT7W6h4x8b5Q8G7wW7S', 3, 1, '2026-03-09 08:56:03'),
('cd54602a-1b95-11f1-a2a0-853fa890d88b', 'Aisha Instructor', 'aisha@cybernext.local', '$2a$10$7EqJtq98hPqEX7fNZaFWoOHi6M9M0Wn4R7iT7W6h4x8b5Q8G7wW7S', 2, 1, '2026-03-09 08:56:03'),
('cd54a7ce-1b95-11f1-a2a0-853fa890d88b', 'Nimal Student', 'nimal@cybernext.local', '$2a$10$7EqJtq98hPqEX7fNZaFWoOHi6M9M0Wn4R7iT7W6h4x8b5Q8G7wW7S', 1, 1, '2026-03-09 08:56:03'),
('cd54ee00-1b95-11f1-a2a0-853fa890d88b', 'Kavya Student', 'kavya@cybernext.local', '$2a$10$7EqJtq98hPqEX7fNZaFWoOHi6M9M0Wn4R7iT7W6h4x8b5Q8G7wW7S', 1, 1, '2026-03-09 08:56:03');

-- Insert Domains
INSERT INTO domains (id, name, description) VALUES
(1, 'Cybersecurity Fundamentals', 'Core security concepts and foundational knowledge'),
(2, 'Ethical Hacking & Linux', 'Offensive security basics and Linux hardening');

-- Insert Courses (3 new courses)
INSERT INTO courses (id, domain_id, title, description, level, duration_hrs, is_published, created_by, created_at) VALUES
(1, 1, 'Introduction to Cybersecurity', 'Comprehensive 7-week course covering SOC operations, threat analysis, CIA Triad, IAM, malware, cloud security, and incident response.', 'beginner', 21, 1, 'cd54602a-1b95-11f1-a2a0-853fa890d88b', '2026-03-09 08:56:03'),
(2, 2, 'Ethical Hacking Essentials', 'Practical 4-week Linux security course with hardening, firewall configuration, and incident response techniques.', 'intermediate', 12, 1, 'cd54602a-1b95-11f1-a2a0-853fa890d88b', '2026-03-09 08:56:03'),
(3, 1, 'Network Security Basics', 'Advanced 6-week course on network attacks, detection, firewalls, VPN, segmentation, and threat hunting.', 'intermediate', 18, 1, 'cd54602a-1b95-11f1-a2a0-853fa890d88b', '2026-03-09 08:56:03');

-- Insert Modules
INSERT INTO modules (id, course_id, title, module_order) VALUES
-- Course 1: Intro to Cybersecurity (7 weeks)
(1, 1, 'Week 1: Modern SOC & Threat Landscape', 1),
(2, 1, 'Week 2: Analyzing Cyber Threats', 2),
(3, 1, 'Week 3: CIA Triad & Security Principles', 3),
(4, 1, 'Week 4: Identity & Access Management', 4),
(5, 1, 'Week 5: Malware Analysis', 5),
(6, 1, 'Week 6: Cloud Security', 6),
(7, 1, 'Week 7: Incident Response Capstone', 7),
-- Course 2: Ethical Hacking / Linux (4 weeks)
(8, 2, 'Week 1: Linux Fundamentals & Secure Terminal', 1),
(9, 2, 'Week 2: Hardening & Password Security', 2),
(10, 2, 'Week 3: Firewall & Network Security', 3),
(11, 2, 'Week 4: Monitoring, Auditing & Response', 4),
-- Course 3: Network Security (6 weeks)
(12, 3, 'Week 1: Network Fundamentals & Packet Analysis', 1),
(13, 3, 'Week 2: Network Attacks & Intrusion Detection', 2),
(14, 3, 'Week 3: Firewall Hardening & iptables', 3),
(15, 3, 'Week 4: VPN & Encrypted Tunnels', 4),
(16, 3, 'Week 5: Network Segmentation & Zero Trust', 5),
(17, 3, 'Week 6: Threat Hunting & Network Forensics', 6);

-- Insert Lessons (one per module with full markdown content)
INSERT INTO lessons (id, module_id, title, content_md, lesson_order, created_at) VALUES
(1, 1, 'Week 1: Modern SOC & Threat Landscape', '# Week 1: Modern SOC & Threat Landscape\n\n## Learning Objectives\n- Understand SOC operations and structure\n- Learn network monitoring fundamentals\n- Explore threat landscape trends\n\n## Topics\n- SOC workflows and incident triage\n- Network baseline establishment\n- Threat intelligence sources\n\n## Tools Covered\n- **nmap**: Network reconnaissance and port scanning\n- **Wireshark**: Packet capture and analysis\n- **tcpdump**: Command-line packet capture\n\n## Hands-On Lab\nUse nmap to scan a practice network and identify active hosts and open ports. Capture traffic with Wireshark to understand normal vs. suspicious behavior.\n\n## Key Takeaways\n- SOCs aggregate security events from multiple sources\n- Baseline networks first to detect anomalies\n- Understand the threat landscape in your industry', 1, '2026-03-09 08:56:03'),
(2, 2, 'Week 2: Analyzing Cyber Threats', '# Week 2: Analyzing Cyber Threats\n\n## Learning Objectives\n- Analyze different attack types\n- Understand malware behavior\n- Learn forensic analysis basics\n\n## Attack Categories\n- Phishing and social engineering\n- Malware variants (trojans, ransomware, worms)\n- Network-based attacks\n\n## Forensic Fundamentals\n- Evidence preservation\n- Timeline analysis\n- Artifact collection\n\n## Hands-On Lab\nAnalyze captured malware samples in a sandbox environment. Identify indicators of compromise (IOCs) and create detection signatures.\n\n## Case Study\nWalkthrough of a real phishing campaign that compromised a financial institution and the investigation process.', 1, '2026-03-09 08:56:03'),
(3, 3, 'Week 3: CIA Triad & Security Principles', '# Week 3: CIA Triad & Security Principles\n\n## The CIA Triad\n| Pillar | Definition | Example |\n|--------|-----------|----------|\n| Confidentiality | Data only accessible to authorized users | Encryption of sensitive files |\n| Integrity | Data accuracy and completeness | Digital signatures verify authenticity |\n| Availability | Systems and data accessible when needed | Redundancy and failover systems |\n\n## Key Takeaways\n- Apply CIA Triad to every security decision\n- Balance all three pillars appropriately', 1, '2026-03-09 08:56:03'),
(4, 4, 'Week 4: Identity & Access Management', '# Week 4: Identity & Access Management\n\n## IAM Concepts\n- Authentication vs. Authorization\n- Role-based access control (RBAC)\n- Multi-factor authentication (MFA)\n\n## Linux User Management\nCreate secure user accounts and manage permissions effectively using Linux tools.\n\n## PAM Configuration\n- Configure password policies\n- Implement account lockout\n- Set session timeouts\n\n## Tools\n- **PAM**: Pluggable Authentication Modules\n- **sudo**: Privilege escalation\n- **chage**: Password aging\n\n## Security Best Practices\n- Regular access reviews\n- Immediate offboarding procedures\n- Segregation of duties', 1, '2026-03-09 08:56:03'),
(5, 5, 'Week 5: Malware Analysis', '# Week 5: Malware Analysis\n\n## Static vs. Dynamic Analysis\n- **Static**: Examine code without execution (strings, file hashing)\n- **Dynamic**: Run in controlled environment (sandbox, VM)\n\n## Tools and Techniques\n- **VirusTotal**: Check against 70+ antivirus engines\n- **Any.run**: Interactive sandbox analysis\n- **IDA Pro / Ghidra**: Disassembly and reverse engineering\n\n## IOCs (Indicators of Compromise)\n- File hashes (MD5, SHA-256)\n- Domain names and IP addresses\n- Registry keys and process names\n\n## Hands-On Lab\nAnalyze a malware sample in sandbox. Document behavior, IOCs, and MITRE ATT&CK techniques used.\n\n## Case Studies\n- Emotet banking trojan\n- WannaCry ransomware\n- Stuxnet malware', 1, '2026-03-09 08:56:03'),
(6, 6, 'Week 6: Cloud Security', '# Week 6: Cloud Security\n\n## AWS Security Fundamentals\n- IAM roles and policies\n- Security groups and network ACLs\n- S3 bucket policies and encryption\n\n## Common Misconfigurations\n- Public S3 buckets\n- Overly permissive IAM policies\n- Unencrypted databases\n\n## Azure Security\n- Resource groups and RBAC\n- Network security groups\n- Key Vault for secrets management\n\n## Hands-On Lab\nAudit an AWS S3 bucket. Implement proper IAM policies. Use AWS Config for compliance.\n\n## Best Practices\n- Enable CloudTrail logging\n- Regular security assessments\n- Automated compliance checking', 1, '2026-03-09 08:56:03'),
(7, 7, 'Week 7: Incident Response Capstone', '# Week 7: Incident Response Capstone\n\n## Incident Response Phases\n1. Preparation: Tools, documentation, contacts\n2. Detection & Analysis: Identify and scope incident\n3. Containment: Stop spread of compromise\n4. Eradication: Remove malware and close entry points\n5. Recovery: Restore systems to normal operations\n6. Post-Incident: Review and improve\n\n## Capstone Project\nInvestigate a complex incident scenario involving multiple systems:\n- Analyze logs from web server, firewall, and endpoints\n- Establish attack timeline\n- Identify root cause\n- Recommend remediation\n- Document findings\n\n## Reporting Standards\n- Executive summary for leadership\n- Technical findings for IT team\n- Recommendations for prevention\n- MITRE ATT&CK framework mapping', 1, '2026-03-09 08:56:03'),
(8, 8, 'Week 1: Linux Fundamentals & Secure Terminal', '# Week 1: Linux Fundamentals & Secure Terminal\n\n## Linux Basics for Security\n- File permissions and ownership\n- User and group management\n- Process monitoring with ps and top\n\n## Secure Shell (SSH)\n- Generate strong SSH keys\n- Configure SSH daemon for security\n- Key-based authentication\n\n## File Permissions\n- rwx permissions for user/group/others\n- setuid/setgid special permissions\n- Umask configuration\n\n## Essential Commands\n- chmod, chown: File permissions\n- sudo: Privilege escalation\n- lastlog: Login history', 1, '2026-03-09 08:56:03'),
(9, 9, 'Week 2: Hardening & Password Security', '# Week 2: Hardening & Password Security\n\n## PAM Configuration\n- Enforce password policies\n- Password complexity requirements\n- History and aging controls\n\n## Password Aging with chage\n- Set password expiration\n- Configure minimum days between changes\n- Warning periods before expiry\n\n## Account Lockout\n- Failed login attempt limits\n- Automatic temporary account lock\n- pam_tally for tracking\n\n## Tools\n- **Lynis**: Security auditing framework\n- **aide**: File integrity monitoring\n- **chkrootkit**: Rootkit detection\n\n## CIS Benchmarks\nAlign with Center for Internet Security hardening standards for your Linux distribution.\n\n## Hands-On Lab\nRun Lynis audit and remediate vulnerabilities. Configure strong password policies.', 1, '2026-03-09 08:56:03'),
(10, 10, 'Week 3: Firewall & Network Security', '# Week 3: Firewall & Network Security\n\n## UFW (Uncomplicated Firewall)\n- Set default policies for incoming/outgoing\n- Allow specific services and ports\n- Enable rate limiting for protection\n\n## Rate Limiting\n- Limit connections per IP address\n- Protect against brute force attacks\n- Maximum 6 connections per 30 seconds\n\n## Connection Logging\n- Enable UFW logging\n- Monitor blocked connections\n- Analyze patterns for threats\n\n## Hands-On Lab\nConfigure firewall with UFW:\n1. Set restrictive defaults\n2. Create rate limiting rules\n3. Monitor blocked connections\n4. Implement stateful inspection', 1, '2026-03-09 08:56:03'),
(11, 11, 'Week 4: Monitoring, Auditing & Response', '# Week 4: Monitoring, Auditing & Response\n\n## auditd (Linux Audit Framework)\n- Monitor file access and changes\n- Track system calls and policy violations\n- Comprehensive audit logging\n\n## fail2ban (IDS/IPS)\n- Detect brute force attacks\n- Automatically block suspicious IPs\n- Configure jails for different services\n\n## Log Analysis\n- Review /var/log/auth.log\n- Monitor system.journal\n- Track kernel messages in dmesg\n\n## Incident Response Workflow\n1. Alert triggered\n2. Investigation and triage\n3. Containment (block IP)\n4. Eradication (remove malware)\n5. Recovery (restore services)\n6. Post-incident review\n\n## Hands-On Lab\nSet up monitoring with auditd and fail2ban. Test brute force protection and analyze incident response.', 1, '2026-03-09 08:56:03'),
(12, 12, 'Week 1: Network Fundamentals & Packet Analysis', '# Week 1: Network Fundamentals & Packet Analysis\n\n## OSI Model and Network Protocols\n| Layer | Protocol | Tool |\n|-------|----------|------|\n| Layer 3 | IP | ping, traceroute |\n| Layer 4 | TCP/UDP | netstat, ss |\n| Layer 7 | HTTP/HTTPS | curl, browser |\n\n## Wireshark Basics\n- Capture filters and display filters\n- Follow TCP stream for full conversation\n\n## Network Baselines\n- Establish normal traffic patterns\n- Document typical bandwidth usage\n- Identify normal vs. anomalous behavior\n\n## tcpdump Commands\n- Capture all traffic\n- Filter by port or protocol\n- Save to file for analysis\n\n## Hands-On Lab\nSet up Wireshark packet capture and analyze traffic.', 1, '2026-03-09 08:56:03'),
(13, 13, 'Week 2: Network Attacks & Intrusion Detection', '# Week 2: Network Attacks & Intrusion Detection\n\n## Common Network Attacks\n- SYN Flood: Overwhelm server resources\n- UDP Flood: Exhaust bandwidth\n- ICMP Ping Flood: Network overload\n\n## Intrusion Detection Systems (IDS)\n- **Suricata**: Open-source network IDS/IPS\n- **Snort**: Industry-standard IDS\n- **Zeek**: Network intelligence\n\n## Detection Rules\n- Create custom detection signatures\n- Match on protocol anomalies\n- Alert on suspicious patterns\n\n## Hands-On Lab\nDeploy Suricata IDS and generate test attacks. Capture and analyze alerts from suspicious traffic.', 1, '2026-03-09 08:56:03'),
(14, 14, 'Week 3: Firewall Hardening & iptables', '# Week 3: Firewall Hardening & iptables\n\n## iptables Overview\n- Kernel firewall framework\n- Three tables: filter, nat, mangle\n- Three chains: INPUT, OUTPUT, FORWARD\n\n## Basic iptables Rules\n- Allow SSH, HTTP, HTTPS\n- Set default deny policies\n- Configure stateful filtering\n\n## NAT and Port Forwarding\n- Enable IP forwarding\n- Port forwarding configurations\n\n## Rate Limiting\n- Limit SYN packets\n- Prevent resource exhaustion\n\n## Persistence\n- Save rules for reboot\n- Automatic restoration at startup\n\n## Hands-On Lab\nConfigure iptables from scratch with persistence and test rules.', 1, '2026-03-09 08:56:03'),
(15, 15, 'Week 4: VPN & Encrypted Tunnels', '# Week 4: VPN & Encrypted Tunnels\n\n## VPN Fundamentals\n- Encrypts all traffic through tunnel\n- Masks user IP address\n- Enables secure remote access\n\n## OpenVPN Setup\n- install and initialize\n- Generate certificates and keys\n- Configure server and client\n\n## WireGuard (Modern Alternative)\n- Generate keys\n- Configure interface\n- Much simpler than OpenVPN\n- Better performance with ~4,000 LOC\n\n## Hands-On Lab\nSet up OpenVPN server and compare with WireGuard. Test VPN connectivity and encryption.', 1, '2026-03-09 08:56:03'),
(16, 16, 'Week 5: Network Segmentation & Zero Trust', '# Week 5: Network Segmentation & Zero Trust\n\n## Network Segmentation\n- Divide network into zones\n- Reduce lateral movement\n- Limit damage from breaches\n\n## VLAN Configuration\n- Create VLANs for different zones\n- Configure inter-VLAN routing\n- Manage access between segments\n\n## DMZ (Demilitarized Zone)\n- Separate public from internal networks\n- Firewall rules for zone boundaries\n\n## Zero Trust Architecture\n- Every device and access verified\n- Implement least privilege\n- Continuous monitoring\n\n## Hands-On Lab\nDesign network segmentation and configure VLANs. Test DMZ firewall rules and microsegmentation.', 1, '2026-03-09 08:56:03'),
(17, 17, 'Week 6: Threat Hunting & Network Forensics', '# Week 6: Threat Hunting & Network Forensics\n\n## Threat Hunting Process\n1. Develop hypothesis from threat intelligence\n2. Collect and analyze data\n3. Document anomalies and IOCs\n4. Verify findings with multiple sources\n\n## Network Forensics Techniques\n- C2 (Command and Control) detection\n- IOC (Indicator of Compromise) pivoting\n- Beaconing pattern identification\n\n## Tools\n- **Zeek**: Network intelligence\n- **ELK Stack**: Log aggregation\n- **Splunk**: Enterprise SIEM\n- **NetworkMiner**: Network forensics\n\n## Hands-On Lab\nHunt for C2 beaconing in network traffic. Identify IOCs and investigate attack infrastructure.', 1, '2026-03-09 08:56:03');

-- Insert Enrollments (for testing)
INSERT INTO enrollments (user_id, course_id, enrolled_at) VALUES
('cd54a7ce-1b95-11f1-a2a0-853fa890d88b', 1, '2026-03-15 09:00:00'),
('cd54a7ce-1b95-11f1-a2a0-853fa890d88b', 2, '2026-03-16 10:00:00'),
('cd54a7ce-1b95-11f1-a2a0-853fa890d88b', 3, '2026-03-17 11:00:00'),
('cd54ee00-1b95-11f1-a2a0-853fa890d88b', 1, '2026-03-15 14:00:00');

-- Insert Certificates (example)
INSERT INTO certificates (user_id, course_id, certificate_code, issued_at, pdf_path) VALUES
('cd54a7ce-1b95-11f1-a2a0-853fa890d88b', 1, 'CYBER-2026-NML01', '2026-03-25 12:00:00', '/certs/CYBER-2026-NML01.pdf');

/*!40101 SET sql_mode=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

-- Seed completed: 17 lessons across 3 courses, 2026-03-28
