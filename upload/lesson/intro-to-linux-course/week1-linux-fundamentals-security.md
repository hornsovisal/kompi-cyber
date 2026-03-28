# Week 1: Linux Fundamentals & Secure Terminal Usage

## 🎯 Learning Outcomes

By the end of this week, you will:

- Navigate Linux filesystem securely
- Understand user permissions and file ownership
- Practice safe command execution with sudo principles
- Configure SSH for secure remote access
- Perform basic Linux hardening
- Understand the principle of least privilege in Linux

---

## 📚 Module Overview

| Aspect       | Details                                           |
| ------------ | ------------------------------------------------- |
| **Duration** | 1 week                                            |
| **O/S**      | Ubuntu 22.04 LTS (professional standard)          |
| **Labs**     | 3 hands-on security labs                          |
| **Tools**    | bash, ssh, sudo, chmod, chown, ufw                |
| **Focus**    | Secure defaults, least privilege, user management |

---

## Part 1: Linux Permissions Fundamentals

### 📂 Understanding File Permissions

Every file in Linux has three types of permissions:

```bash
-rw-r--r-- 1 alice developers 4096 Mar 28 2026 document.txt
│││││││││ │ ││││ ││││││││ ││││ ███████████ ███████
│││││││││ │ │ user  group   size   date      filename
│││││││││ │ └─ other permissions (r-x)
│││││││││ └─ group permissions (r--)
│││││││││ └─ owner permissions (rw-)
└──────────── file type (- = regular, d = directory, l = link)

Permission Legend:
r = read (view contents)
w = write (modify/delete)
x = execute (run the file)
- = no permission

Groups of 3:
[rwx] [rwx] [rwx]
owner group other
```

### 🔒 Lab 1: Secure File & Directory Permissions

**Scenario:** You're setting up a web server. Different users need different access levels.

**Setup:**

```bash
# Create a project directory structure
mkdir -p /var/www/secure-app/{config,logs,public_html}
cd /var/www/secure-app

# Create files with different sensitivity
echo "DB_PASSWORD=SecureP@ssw0rd123" > config/database.env   # SENSITIVE!
echo "API_KEY=sk-proj-xyz789abc..." > config/api.env          # SENSITIVE!
touch logs/app.log

# Create users for demo
sudo useradd -m -s /bin/bash webuser       # Web app user
sudo useradd -m -s /bin/bash applogger     # Logging user
```

**Task 1: Fix Overly Permissive Permissions**

```bash
# Current state (INSECURE!)
ls -la /var/www/secure-app/config/
# Output: -rw-r--r-- (everyone can read secrets!)

# Fix: Only owner (root) should read config files
sudo chmod 600 config/database.env
sudo chmod 600 config/api.env

# Verify fix
ls -la config/
# Output: -rw------- (owner only)

# Only the webuser should access app files
sudo chown root:webuser /var/www/secure-app/public_html
sudo chmod 750 /var/www/secure-app/public_html
# 7 = rwx (owner), 5 = r-x (group), 0 = --- (others)
```

**Task 2: Restrictive Directory Permissions**

```bash
# Create a private directory (owner only)
sudo mkdir -m 700 /var/log/secure-app
# 700 = rwx (owner), --- (group), --- (others)

# Verify only the owner can list contents
ls -la /var/log | grep secure-app
# drwx------ (perfect!)

# Allow webuser to write logs
sudo chown root:webuser /var/log/secure-app
sudo chmod 770 /var/log/secure-app
# 770 = rwx (owner), rwx (group), --- (others)
```

**Task 3: Principle of Least Privilege**

```bash
# DON'T DO THIS:
chmod 777 /var/www/secure-app  # ❌ World-writable!

# DO THIS:
chmod 755 /var/www/secure-app  # ✅ Owner write, others read-only
# 7 = rwx (owner), 5 = r-x (others)

# For sensitive files:
chmod 640 config/database.env   # ✅ Owner+group read, no execute
# 6 = rw- (owner), 4 = r-- (group), 0 = --- (others)
```

---

## Part 2: SSH Hardening & Secure Remote Access

### 🔐 Lab 2: Configure SSH for Security

**Objective:** Harden SSH to prevent common attacks (password brute force, root login).

**Default SSH Config:**

```bash
# View current SSH configuration
sudo cat /etc/ssh/sshd_config

# WARNING: Default settings are INSECURE
# - PermitRootLogin yes (attacker can brute force root!)
# - PasswordAuthentication (vulnerable to brute force)
# - Port 22 (standard port, scanners immediately target 22)
```

**Task 1: Generate SSH Key Pairs**

```bash
# Generate a strong ED25519 key pair (better than RSA)
ssh-keygen -t ed25519 -C "your-email@example.com"

# Prompts:
# Enter file in which to save the key: /home/student/.ssh/id_ed25519
# Enter passphrase (empty for no passphrase): [enter strong passphrase]

# Result:
# /home/student/.ssh/id_ed25519 (private key - NEVER share!)
# /home/student/.ssh/id_ed25519.pub (public key - safe to distribute)

# Set proper permissions (critical!)
chmod 700 /home/student/.ssh
chmod 600 /home/student/.ssh/id_ed25519
chmod 644 /home/student/.ssh/id_ed25519.pub
```

**Task 2: Copy Public Key to Remote Server**

```bash
# Method 1: Using ssh-copy-id (recommended)
ssh-copy-id -i ~/.ssh/id_ed25519.pub user@192.168.1.100

# Method 2: Manual (if ssh-copy-id not available)
cat ~/.ssh/id_ed25519.pub | ssh user@192.168.1.100 \
  "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"

# Verify key was added
ssh user@192.168.1.100 "cat ~/.ssh/authorized_keys"
```

**Task 3: Harden SSH Server Configuration**

```bash
# Backup original config
sudo cp /etc/ssh/sshd_config /etc/ssh/sshd_config.backup

# Edit SSH configuration
sudo nano /etc/ssh/sshd_config

# APPLY THESE HARDENING CHANGES:

# 1. Disable root login (prevent direct root compromise)
PermitRootLogin no

# 2. Change default port (reduces noise from automated scanners)
Port 2222        # Use non-standard port (avoid 22)

# 3. Disable password authentication (force key-based)
PasswordAuthentication no
PubkeyAuthentication yes

# 4. Disable empty password login
PermitEmptyPasswords no

# 5. Set login timeout (reduce brute force window)
LoginGraceTime 20

# 6. Limit authentication attempts
MaxAuthTries 3           # After 3 failed attempts, disconnect
MaxSessions 10           # Max concurrent sessions

# 7. Disable X11 forwarding (reduce attack surface)
X11Forwarding no

# 8. Restrict which users can SSH in
AllowUsers alice bob charlie   # Whitelist only needed users

# 9. Disable environment variable passing
PermitUserEnvironment no

# 10. Only allow specific protocols
Protocol 2                      # Only SSH version 2
```

**Task 4: Restart and Test SSH**

```bash
# Test syntax before restarting (critical!)
sudo sshd -t
# If OK: (no output)
# If error: Error message appears

# Restart SSH service
sudo systemctl restart ssh

# Test new configuration (DON'T CLOSE YOUR SESSION!)
ssh -p 2222 alice@192.168.1.100
# Should connect without password (using key)

# Verify password login is disabled
ssh -o PubkeyAuthentication=no alice@192.168.1.100
# Error: Permission denied (publickey)  ✅ CORRECT!
```

---

## Part 3: User & Group Management

### 👥 Lab 3: Secure User Administration

**Scenario:** You're managing a multi-user system. Different users need different access.

**Task 1: Create Users with Proper Security**

```bash
# Create a regular user (not root)
sudo useradd -m -s /bin/bash -c "Web Server User" webserver

# Create a system user (no login shell)
sudo useradd -r -s /bin/false -c "OpenSSH Privilege Separation" sshd

# Set password with expiration
sudo passwd webserver
sudo chage -M 90 webserver  # Force password change every 90 days
sudo chage -W 14 webserver  # Warn 14 days before expiration

# Verify user account
id webserver
# uid=1001(webserver) gid=1001(webserver) groups=1001(webserver)
```

**Task 2: Create Groups & Assign Permissions**

```bash
# Create a developer group
sudo groupadd developers

# Add users to group
sudo usermod -aG developers alice
sudo usermod -aG developers bob

# Create project directory owned by group
sudo mkdir -p /var/projects/app
sudo chown root:developers /var/projects/app
sudo chmod 750 /var/projects/app
# Now developers can read/write, others have no access

# Verify
ls -la /var/projects/
# drwxr-x--- root developers (group can read/write)
```

**Task 3: Configure sudo with Least Privilege**

```bash
# Edit sudoers file (ALWAYS use visudo, NOT nano!)
sudo visudo

# ADD THESE LINES for specific permissions:

# Allow alice to restart Apache without password
alice ALL=(ALL) NOPASSWD: /usr/sbin/apache2ctl

# Allow developers group to restart services
%developers ALL=(ALL) /usr/sbin/systemctl restart *

# Allow bob to run only MySQL commands as mysql user
bob ALL=(mysql) /usr/bin/mysql

# Example: Limit to specific commands only
# (Most secure - minimum necessary permissions)
alice ALL=(ALL) /usr/sbin/apache2ctl, /bin/systemctl restart nginx

# NEVER do this:
# alice ALL=(ALL) NOPASSWD: ALL  ❌ Equivalent to root access!
```

**Task 4: Verify Sudo Configuration**

```bash
# Test sudo with limited permissions
sudo -l
# Lists what commands THIS user can run with sudo

# Switch to another user temporarily
sudo -u webserver id
# Output: uid=1001(webserver) (running as webserver, not root)

# Test denied sudo command
sudo /bin/rm /etc/passwd
# Error: user NOT in sudoers file
```

---

## 🧠 Common Mistakes

1. **❌ chmod 777 everything** → Opens security holes
2. **❌ Running apps as root** → Entire system compromised if app is hacked
3. **❌ Enabling password SSH** → Vulnerable to brute force
4. **❌ Using default SSH port 22** → First port scanned by attackers
5. **❌ Allowing root login via SSH** → Direct root compromise path
6. **❌ Overly permissive sudoers** → Privilege escalation risk

---

## ✅ Completion Checklist

- [ ] Understand Linux permissions (rwx for user/group/other)
- [ ] Fixed overly permissive file permissions
- [ ] Created restrictive directory permissions
- [ ] Generated SSH key pair (ED25519)
- [ ] Copied public key to remote server
- [ ] Hardened SSH configuration
- [ ] Tested SSH with key authentication only
- [ ] Created users and groups properly
- [ ] Configured sudo with least privilege
- [ ] Verified all security settings

**Next Week:** Advanced user permissions, sudo policies, and process management.
