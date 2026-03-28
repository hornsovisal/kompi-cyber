# Week 4: Monitoring, Auditing & Incident Response

## 🎯 Learning Outcomes

By the end of this week, you will:

- Set up comprehensive system audit logging
- Monitor user login activity and system changes
- Detect suspicious process activity
- Configure real-time alerts for security events
- Perform forensic analysis of system logs
- Respond to security incidents

---

## 📚 Module Overview

| Aspect       | Details                                  |
| ------------ | ---------------------------------------- |
| **Duration** | 1 week                                   |
| **Tools**    | auditd, journalctl, fail2ban, ossec      |
| **Focus**    | Detection, monitoring, incident response |
| **Labs**     | 3 hands-on monitoring and forensics labs |

---

## Part 1: System Audit Logging with Auditd

### 🔍 Lab 1: Configure Comprehensive Audit Logging

**Objective:** Track all system changes and suspicious activity.

**Task 1: Install and Enable Auditd**

```bash
# Install auditd (Linux kernel audit framework)
sudo apt-get install -y auditd audispd-plugins

# Start audit daemon
sudo systemctl start auditd
sudo systemctl enable auditd

# Verify it's running
sudo systemctl status auditd
# active (running) ✅

# Check if audit is capturing events
sudo auditctl -l
# (shows current rules, empty if none configured)
```

**Task 2: Create Audit Rules for Critical Files**

```bash
# Create persistent audit rules file
sudo nano /etc/audit/rules.d/custom.rules

# ADD THESE RULES:

# Monitor password file changes (immediate detection of new accounts)
-w /etc/passwd -p wa -k passwd_changes
-w /etc/shadow -p wa -k shadow_changes
-w /etc/group -p wa -k group_changes

# Monitor sudo access (all privileged commands)
-w /etc/sudoers -p wa -k sudoers_changes
-w /etc/sudoers.d/ -p wa -k sudoers_d_changes

# Monitor SSH configuration (detect unauthorized SSH changes)
-w /etc/ssh/sshd_config -p wa -k sshd_config_changes

# Monitor user login/logout
-w /var/log/faillog -p wa -k faillog_changes
-w /var/log/lastlog -p wa -k lastlog_changes
-w /var/log/wtmp -p wa -k wtmp_changes
-w /var/log/btmp -p wa -k btmp_changes

# Monitor system calls (advanced detection)
-a always,exit -F arch=b64 -S adjtimex -S settimeofday -k time_change
-a always,exit -F arch=b64 -S sethostname -S setdomainname -k network_modifications

# Monitor file deletion/removal (forensic evidence)
-a always,exit -F arch=b64 -S unlink -S unlinkat -S rename -S renameat -F auid>=1000 -F auid!=-1 -k delete

# Monitor unauthorized access attempts
-a always,exit -F arch=b64 -S open -S openat -F exit=-EACCES -F auid>=1000 -F auid!=-1 -k access_denied
-a always,exit -F arch=b64 -S open -S openat -F exit=-EPERM -F auid>=1000 -F auid!=-1 -k access_denied_perm

# Load rules permanently
sudo systemctl restart auditd
```

**Task 3: Query Audit Logs**

```bash
# View real-time audit events
sudo tail -f /var/log/audit/audit.log

# Search for file modifications to /etc/passwd
sudo ausearch -k passwd_changes
# Output:
# time->Thu Mar 28 14:32:15 2026
# type=PATH msg=audit(1743160335.123:456): item=0 name="/etc/passwd" ...
# type=CWD msg=audit(1743160335.123:456): cwd="/home/alice"

# Search for sudo commands
sudo ausearch -k sudoers_d_changes | tail -5

# Find all events from specific user
sudo ausearch -ua alice

# Find SSH configuration changes
sudo ausearch -k sshd_config_changes

# Generate report of recent changes
sudo aureport --file | head -20
```

---

## Part 2: Login Monitoring & Threat Detection

### 🔍 Lab 2: Monitor Login Activity & Detect Attacks

**Objective:** Detect unauthorized access attempts and compromised accounts.

**Task 1: Monitor Failed Login Attempts**

```bash
# Install fail2ban (automatic blocker of brute force)
sudo apt-get install -y fail2ban

# Configure fail2ban
sudo nano /etc/fail2ban/jail.local

# ADD THESE SETTINGS:
[DEFAULT]
destemail = admin@example.com
sender = admin@example.com
action = %(action_mwl)s              # Mail with lines

[sshd]
enabled = true
port = 2222                           # Custom SSH port
filter = sshd
logpath = /var/log/auth.log
maxretry = 3                          # Ban after 3 failed attempts
findtime = 600                        # Within 10 minutes
bantime = 3600                        # Ban for 1 hour
ignoreip = 127.0.0.1 192.168.1.100  # Whitelist these IPs

# Start fail2ban
sudo systemctl start fail2ban
sudo systemctl enable fail2ban

# Check if jail is active
sudo fail2ban-client status sshd
# Status for the jail sshd:
# |- Filter
# |  |- Currently failed:     2
# |  |- Total failed:         5
# |  `- File list:            /var/log/auth.log
# |- Actions
# |  |- Currently banned:     0
# |  |- Total banned:         2
# |  `- Banned IP list:       203.0.113.45
```

**Task 2: Analyze Failed Login Attempts**

```bash
# View failed login summary
sudo grep "Failed password" /var/log/auth.log | wc -l
# 47 failed attempts

# Get top IPs with failed logins
sudo grep "Failed password" /var/log/auth.log | \
  awk '{print $(NF-3)}' | sort | uniq -c | sort -rn | head
# 15 203.0.113.45        <- Brute force attack!
# 8 198.51.100.200
# 4 192.168.100.50

# Get failed login timeline
sudo grep "Failed password" /var/log/auth.log | \
  tail -10 | awk '{print $1, $2, $3}'
# Mar 28 14:32:17    14:32:35    14:32:48  <- Rapid attempts!

# Suspicious user lockouts (account compromise indicator)
sudo grep "account locked" /var/log/auth.log

# Successful logins from unusual times/IPs
sudo grep "Accepted password" /var/log/auth.log | grep "alice" | grep "02:"
# 2:15 AM login to alice account (unusual time!)
```

**Task 3: Create Real-Time Alerts**

```bash
# Create alert script
cat > /usr/local/bin/security-alert.sh << 'EOF'
#!/bin/bash

LOG_FILE="/var/log/auth.log"
TIMESTAMP=$(date +%s)
LAST_CHECK_FILE="/tmp/last_security_check"

# Get last check time (or use 1 hour ago)
if [ -f "$LAST_CHECK_FILE" ]; then
    LAST_CHECK=$(cat "$LAST_CHECK_FILE")
else
    LAST_CHECK=$((TIMESTAMP - 3600))  # 1 hour
fi

# Check for brute force (20+ failed attempts in 10 min)
FAILED_COUNT=$(sudo grep "Failed password" $LOG_FILE | \
  grep "$(date +%b\ %d)" | wc -l)

if [ "$FAILED_COUNT" -gt 20 ]; then
    echo "ALERT: Brute force detected - $FAILED_COUNT failed attempts"
    # Send email/alert here
fi

# Check for new user creation
if sudo grep "new user" /var/log/auth.log | grep "$(date +%b\ %d)"; then
    echo "ALERT: New user created on $(date)"
fi

# Check for privilege escalation (sudo without password)
if sudo grep "COMMAND=" /var/log/auth.log | grep "NOPASS"; then
    echo "ALERT: Privilege escalation detected"
fi

# Save current timestamp
echo "$TIMESTAMP" > "$LAST_CHECK_FILE"
EOF

chmod +x /usr/local/bin/security-alert.sh

# Schedule to run every 10 minutes
sudo crontab -e
# Add: */10 * * * * /usr/local/bin/security-alert.sh
```

---

## Part 3: Process & System Monitoring

### 🔍 Lab 3: Detect Unauthorized Processes & Changes

**Task 1: Monitor Process Activity**

```bash
# View all running processes
ps auxf

# Find suspicious processes (reverse shell indicators)
ps aux | grep -E 'nc|bash|sh|perl|python' | grep -v grep

# Monitor for new processes in real-time
watch -n 1 'ps aux | tail -20'

# Find processes using unusual ports
sudo netstat -tulpn
# Identify unexpected connections

# Kill suspicious process
sudo kill -9 <PID>
```

**Task 2: Monitor Network Connections**

```bash
# View all network connections
sudo netstat -antp

# Find unexpected outbound connections (data exfiltration)
sudo netstat -antp | grep ESTABLISHED | grep :443
# Look for unusual IPs sending data

# Monitor for backdoors (listening ports)
sudo netstat -tulpn | grep LISTEN
# LISTEN should only have expected services (SSH, HTTP, etc.)

# Detect reverse shells (local port calling external IP)
sudo ss -antp | grep ESTABLISHED | awk '{print $5}' | \
  awk -F: '{print $1}' | sort | uniq -c | sort -rn
```

**Task 3: Create Change Detection System**

```bash
# Install AIDE (Advanced Intrusion Detection Environment)
sudo apt-get install -y aide aide-common

# Initialize AIDE database (takes 10+ minutes)
sudo aideinit

# Check for file changes
sudo aide --check

# Output example:
# changed: /etc/passwd
# changed: /etc/shadow
# changed: /root/.ssh/authorized_keys (new backdoor!)
# new: /tmp/.hidden_shell.sh (suspicious!)

# Create daily change report
cat > /usr/local/bin/daily-change-report.sh << 'EOF'
#!/bin/bash
echo "=== FILES CHANGED IN LAST 24 HOURS ==="
sudo aide --check 2>&1 | grep -E 'changed:|new:'
EOF

chmod +x /usr/local/bin/daily-change-report.sh

# Schedule daily
sudo crontab -e
# Add: 0 6 * * * /usr/local/bin/daily-change-report.sh | mail -s "Daily Change Report" admin@example.com
```

---

## Part 4: Incident Response Workflow

### 🚨 Incident Response Checklist

**1. DETECT (You are here)**

- [ ] Unusual system behavior noticed
- [ ] Alerts triggered (failed logins, new processes, file changes)
- [ ] Security event confirmed

**2. INVESTIGATE**

```bash
# Collect evidence (timestamp = critical!)
date > /evidence.txt
ss -antp >> /evidence.txt          # Network connections
ps auxf >> /evidence.txt            # Running processes
last -f /var/log/wtmp >> /evidence.txt  # Login history
sudo ausearch -k all >> /evidence.txt    # Audit logs
```

**3. CAPTURE LOGS (Preserve Evidence)**

```bash
# Copy logs to safe location
mkdir -p /evidence/logs_$(date +%s)
sudo cp /var/log/auth.log /evidence/logs_*/
sudo cp /var/log/audit/audit.log /evidence/logs_*/
sudo cp /var/log/syslog /evidence/logs_*/

# Hash files (proof they haven't changed)
sudo sha256sum /evidence/logs_*/* > /evidence/HASHES.txt
```

**4. IDENTIFY ATTACKER ACTIONS**

```bash
# Timeline analysis
sudo grep "$(date +%b\ %d)" /var/log/auth.log | grep Accepted
# Shows successful logins - identify unauthorized ones

sudo ausearch -ts today | grep 'type=EXECVE'
# Shows all commands executed today

sudo grep 'user=alice' /var/log/audit/audit.log
# All actions by suspicious user
```

**5. CONTAINMENT**

```bash
# Kill attacker's processes
sudo kill -9 <PID>

# Block attacker IP
sudo ufw deny from 203.0.113.45

# Reset compromised credentials
sudo passwd alice
sudo ssh-keygen -R "203.0.113.45" ~/.ssh/known_hosts
```

**6. ERADICATION & RECOVERY**

```bash
# Remove backdoors/malware
sudo rm /tmp/.hidden_shell.sh
sudo rm /home/alice/.ssh/authorized_keys_backup

# Revert unauthorized changes
sudo git checkout /etc/ssh/sshd_config  # If version controlled
```

**7. POST-INCIDENT**

```bash
# Change all credentials
sudo passwd root
sudo passwd alice
sudo ssh-keygen -A  # Regenerate SSH keys

# Run full security audit
sudo lynis audit system --full

# Implement defensive measures
# (from previous weeks: SSH hardening, firewall, etc.)
```

---

## ✅ Completion Checklist

- [ ] Installed and configured auditd
- [ ] Created audit rules for critical files
- [ ] Queried audit logs for events
- [ ] Installed and configured fail2ban
- [ ] Analyzed failed login attempts
- [ ] Created real-time security alert script
- [ ] Monitored process activity
- [ ] Detected network connections
- [ ] Set up AIDE for file change detection
- [ ] Created incident response workflow
- [ ] Performed forensic analysis of sample incident
- [ ] Documented all findings

**Congratulations!** You've completed the Linux Security course. You can now:
✓ Harden Linux systems
✓ Configure secure access controls
✓ Monitor for security threats
✓ Respond to security incidents
✓ Conduct forensic analysis
✓ Real-world SOC defender skills!
