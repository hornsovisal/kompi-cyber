# Module 4: Linux Advanced Security

## Learning Objectives

- Configure user roles and security policies
- Implement firewall rules and network security
- Set up SSH key-based authentication
- Monitor system logs and detect intrusions
- Apply security hardening techniques

## User Privilege Management

### Privilege Escalation with sudo

```bash
# View sudo permissions
sudo -l

# Edit sudoers file (safely)
sudo visudo

# Example sudoers entry
username ALL=(ALL) NOPASSWD: /usr/bin/systemctl
```

### User Groups and Permissions

```bash
# Create user group
sudo groupadd developers

# Add user to group
sudo usermod -aG developers username

# Check user groups
groups username
```

## SSH Security Hardening

### Key-Based Authentication

```bash
# Generate SSH keys
ssh-keygen -t rsa -b 4096 -f ~/.ssh/id_rsa

# Copy public key to server
ssh-copy-id -i ~/.ssh/id_rsa.pub user@host

# Disable password login in sshd_config
PasswordAuthentication no
PermitRootLogin no
Port 2222  # Change from default port 22
```

## System Logging and Monitoring

### View System Logs

```bash
# Authentication logs
sudo tail -f /var/log/auth.log

# System events
sudo journalctl -xe

# Security logs
sudo grep "sudo" /var/log/auth.log
```

### Setting Up Log Rotation

```bash
# Configure logrotate
sudo vim /etc/logrotate.d/myapp

# Example configuration
/var/log/myapp.log {
    daily
    rotate 7
    compress
    missingok
    notifempty
}
```

## Firewall Configuration

### UFW (Uncomplicated Firewall)

```bash
# Enable firewall
sudo ufw enable

# Allow SSH (important!)
sudo ufw allow 22

# Allow HTTP/HTTPS
sudo ufw allow 80
sudo ufw allow 443

# Deny all incoming
sudo ufw default deny incoming

# Check status
sudo ufw status
```

## Security Updates and Patching

```bash
# Check available updates
sudo apt update

# Install security updates
sudo apt install -y unattended-upgrades

# Enable automatic updates
sudo dpkg-reconfigure -plow unattended-upgrades
```

## File Integrity Monitoring

### Using AIDE (Advanced Intrusion Detection Environment)

```bash
# Install AIDE
sudo apt install aide aide-common

# Initialize database
sudo aideinit

# Check for changes
sudo aide --check
```

## Real-World Scenario

**Hardening a Production Server**

1. Change default SSH port to 2222
2. Configure SSH key authentication, disable passwords
3. Set up UFW firewall with minimal access
4. Enable automatic security updates
5. Configure SELinux/AppArmor
6. Monitor logs with syslog-ng or ELK stack
7. Implement filesystem auditing with auditd

## Best Practices

- Regular updates and patches
- Principle of least privilege
- Monitor and audit all access
- Use strong authentication (keys, 2FA)
- Disable unnecessary services
- Keep detailed logs
- Perform regular backups
- Security testing and assessments

## Quick Check

1. Using `sudo` daily is more secure than using a standard user account. **(False - minimize sudo use)**
2. SSH keys are more secure than passwords for authentication. **(True)**
3. Port 22 should always remain open for SSH access. **(False - change default ports)**

## Summary

Linux security requires careful configuration of users, permissions, authentication, and monitoring. Implementing defense-in-depth strategies protects systems from unauthorized access and threats.
