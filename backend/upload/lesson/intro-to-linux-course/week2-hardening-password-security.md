# Week 2: Linux Hardening & Password Security

## 🎯 Learning Outcomes

By the end of this week, you will:

- Implement strong password policies
- Configure Linux password aging and expiration
- Use PAM for advanced authentication
- Set up password complexity requirements
- Enforce account lockout after failed attempts
- Perform security audits with Lynis

---

## 📚 Module Overview

| Aspect       | Details                                              |
| ------------ | ---------------------------------------------------- |
| **Duration** | 1 week                                               |
| **Tools**    | PAM, shadow, chage, sudo, Lynis                      |
| **Focus**    | Password security, account policies, hardening audit |
| **Labs**     | 3 practical password security labs                   |

---

## Part 1: Linux Password Management

### 🔐 Understanding Password Storage

```bash
# Password file (publicly readable - hashes only)
cat /etc/passwd | head -3
# root:x:0:0:root:/root:/bin/bash
#      ^ indicates shadow file is used

# Shadow file (root-only - contains actual hashes)
sudo cat /etc/shadow | head -3
# root:$6$rounds=656000$...:19031:0:99999:7:::
#     ││││││││││││││││││  ││││ ││ ││││  │
#     hash type & salt    days  warn expire lock

# Hash fields:
# $6$ = SHA-512 (strong)
# rounds=656000 = iterations (more = slower to crack)
# $ = salt hash (random per user - prevents rainbow tables)
```

### 📋 Lab 1: Configure Password Policies

**Task 1: Set Password Aging Requirements**

```bash
# Configure password policy for new users
sudo nano /etc/default/useradd

# ADD/MODIFY THESE LINES:
PASS_MAX_DAYS=90      # Force change every 90 days
PASS_MIN_DAYS=1       # Prevent changing same day
PASS_MIN_LEN=14       # Minimum 14 characters
PASS_WARN_AGE=14      # Warn 14 days before expiration

# Apply to existing user
sudo chage -M 90 alice      # Max 90 days
sudo chage -m 1 alice       # Min 1 day
sudo chage -W 14 alice      # Warn 14 days
sudo chage -I 7 alice       # Lock after 7 days of expiration

# View a user's password aging info
sudo chage -l alice
# Output:
# Last password change                  : Mar 28, 2026
# Password expires                      : Jun 26, 2026
# Password inactive                     : Jul 03, 2026
# Account expires                       : never
# Minimum number of days between changes: 1
# Maximum number of days between changes: 90
# Number of days of warning before pass expiration: 14
```

**Task 2: Enforce Password Complexity**

```bash
# Install libpam-pwquality for complex passwords
sudo apt-get update
sudo apt-get install -y libpam-pwquality

# Configure password requirements
sudo nano /etc/security/pwquality.conf

# ADD THESE SETTINGS:
minlen=14              # Minimum 14 characters
dcredit=-1             # Require at least 1 digit
ucredit=-1             # Require at least 1 uppercase
lcredit=-1             # Require at least 1 lowercase
ocredit=-1             # Require at least 1 special char
maxrepeat=3            # Max 3 repeated chars (no "aaaa")
difok=4                # At least 4 chars different from old password
usercheck=1            # Don't allow username in password

# Test new password requirement
su - testuser
passwd
# New password: Test123!weak  (no uppercase/special)
# Error: BAD PASSWORD: ... the password is too simple

# New password: Secure@P@ssw0rd%2026  (complex)
# Password updated successfully ✅
```

**Task 3: Implement Account Lockout**

```bash
# Edit PAM configuration for login security
sudo nano /etc/pam.d/common-password

# Find the pam_unix.so line and modify to:
password [success=1 default=ignore] pam_unix.so obscure use_authtok try_first_pass yescrypt

# Add account lockout policy
sudo nano /etc/pam.d/common-auth

# ADD THIS LINE to lock account after failed attempts:
auth required pam_tally2.so onerr=fail audit silent deny=5 unlock_time=900

# Explanation:
# deny=5 ➜ Lock after 5 failed attempts
# unlock_time=900 ➜ Unlock after 15 minutes (900 seconds)
# audit ➜ Log failed attempts

# Check failed login attempts
sudo pam_tally2
# alice              4     root

# Manually unlock an account
sudo pam_tally2 -u alice -r
# pam_tally2: Cleared 4 records.

# Test the policy
# Try to SSH with wrong password 5 times
ssh alice@localhost           # Wrong password (attempt 1)
ssh alice@localhost           # Wrong password (attempt 2)
ssh alice@localhost           # Wrong password (attempt 3)
ssh alice@localhost           # Wrong password (attempt 4)
ssh alice@localhost           # Wrong password (attempt 5)
ssh alice@localhost           # Error: Account locked!
# Wait 15 minutes or admin unlocks...
```

---

## Part 2: System Hardening with Lynis

### 🔐 Lab 2: Security Audit with Lynis

**Objective:** Use professional hardening tool to identify security gaps.

**Installation:**

```bash
# Install Lynis
curl https://downloads.cisofy.com/lynis/lynis-3.0.8.tar.gz | tar xz
cd lynis
sudo ./lynis audit system
```

**Lab Task: Run Security Audit**

```bash
# Run full system audit
sudo lynis audit system --quick

# Output shows security issues like:
# [!!!] Config: MySQL is running but the database files are world-readable
# [!!!] PHP: disable_functions not set
# [!!]  SSH: Found previously removed SSH key in /var/lib/openssh-keyscan
# [-]   Firewall: iptables loaded, but no rules defined
# [!]   Account: User 'nobody' has empty password field in /etc/passwd

# Based on audit results, fix issues:

# 1. Fix world-readable database files
sudo chmod 700 /var/lib/mysql

# 2. Harden PHP (if installed)
sudo nano /etc/php/*/apache2/php.ini
# disable_functions = exec,passthru,shell_exec,system,proc_open,popen...

# 3. Remove unnecessary SSH keys
sudo rm /var/lib/openssh-keyscan/ssh_host_*

# 4. Enable firewall (see Week 3)

# 5. Check for empty password fields
sudo grep -E '^[^:]*::[^:]*:[^:]*:[^:]*:[^:]*:[^:]*' /etc/passwd /etc/shadow
# (should return empty)
```

---

## Part 3: Privilege Escalation Prevention

### 🔒 Lab 3: Sudo Hardening & Audit

**Objective:** Configure sudo securely and log all privileged commands.

**Task 1: Minimal Sudo Configuration**

```bash
# INSECURE - Don't do this:
# alice ALL=(ALL) NOPASSWD: ALL

# SECURE - Specific commands only:
sudo visudo

# Add these lines:
# Developers can restart services
%developers ALL=(ALL) /usr/sbin/systemctl restart nginx, /usr/sbin/systemctl restart apache2

# Alice can run administrative tasks with password
alice ALL=(ALL) /usr/sbin/useradd, /usr/sbin/userdel, /usr/sbin/usermod

# Apps can run as different user (privilege separation)
apache ALL=(www-data) /usr/bin/php

# Test specific permissions
sudo /usr/sbin/systemctl restart nginx    ✅ (allowed)
sudo /usr/sbin/systemctl restart mysql    ❌ (denied)
```

**Task 2: Enable Sudo Logging**

```bash
# Create dedicated sudo log directory
sudo mkdir -p /var/log/sudo
sudo touch /var/log/sudo/sudo.log

# Configure sudoers to log to file
sudo visudo

# Add these lines:
Defaults log_file="/var/log/sudo/sudo.log"
Defaults log_input, log_output              # Log all input/output
Defaults use_pty                            # Use pseudo-terminal
Defaults requiretty                         # Require terminal

# Restart sudo
sudo systemctl restart sudo

# View sudo logs
sudo cat /var/log/sudo/sudo.log
# Nov 28 14:32:01 : alice : TTY=pts/0 ; PWD=/home/alice ;
#   USER=root ; COMMAND=/usr/sbin/useradd testuser

# Real-time sudo monitoring
sudo tail -f /var/log/sudo/sudo.log
```

**Task 3: Detect Sudo Abuse**

```bash
# Find commands run as root via sudo
sudo journalctl SYSLOG_IDENTIFIER=sudo
# or
sudo cat /var/log/auth.log | grep sudo

# Get all users who used sudo
sudo grep "sudo:" /var/log/auth.log | awk '{print $6}' | sort | uniq

# Get commands run by specific user
sudo grep "alice" /var/log/auth.log | grep sudo

# Find failed sudo attempts (security events!)
sudo grep "sudo.*COMMAND" /var/log/auth.log | grep -v ACCEPT
```

**Task 4: Implement Command Auditing**

```bash
# Use auditd to track all command execution
sudo apt-get install -y auditctl

# Create audit rule for sudo
sudo auditctl -w /usr/bin/sudo -p x -k sudo_commands

# Verify rules
sudo auditctl -l
# -w /usr/bin/sudo -p x -k sudo_commands

# View audit logs
sudo ausearch -k sudo_commands
# Output shows all executions with timestamps, users, commands

# Save rules permanently
sudo nano /etc/audit/rules.d/sudo.rules
# Add: -w /usr/bin/sudo -p x -k sudo_commands

# Restart audit service
sudo systemctl restart auditd
```

---

## 🧠 Strong Password Examples

✅ **STRONG:**

- `Secure@P@ssw0rd%2026` (14 chars, mixed case, numbers, special)
- `Tr0pical!Palm#Beach2026` (24 chars, memorable phrase)
- `C0mpl3x&S3cur3$P@ss!` (20 chars, complexity)

❌ **WEAK:**

- `password123` (common, lowercase)
- `P@ssw0rd` (common pattern)
- `Qwerty123` (keyboard sequence)

---

## ✅ Completion Checklist

- [ ] Configured password aging and expiration policies
- [ ] Enforced password complexity requirements
- [ ] Implemented account lockout after failed attempts
- [ ] Ran Lynis system audit
- [ ] Fixed security issues identified by Lynis
- [ ] Configured sudo with minimal permissions
- [ ] Enabled comprehensive sudo/command logging
- [ ] Set up audit daemon to track privileged commands
- [ ] Tested password policies with real users
- [ ] Verified audit logs contain expected entries

**Next Week:** Firewall configuration, network security, and inbound/outbound rules.
