# Module 3: Recovery and Restoration

## Learning Objectives

- Safely restore systems from backups
- Validate restored system integrity
- Verify incident containment and eradication
- Perform controlled system restart
- Document lessons learned

## Pre-Recovery Assessment

### Verify Incident Containment

Before recovery begins, confirm:

1. **Threat Completely Removed**
   - Malware signatures scanned and cleared
   - Compromised credentials reset
   - Unauthorized access points closed
   - Network isolation removed only when safe

2. **No Persistence Mechanisms**
   - Check for rootkits and backdoors
   - Review system scheduled tasks
   - Examine startup programs
   - Verify firmware integrity

3. **Data Integrity**
   - Validate backup integrity
   - Check for data corruption
   - Verify cryptographic signatures
   - Test restore procedures

## Backup and Recovery Planning

### Backup Strategy (3-2-1 Rule)

- **3** copies of data
- **2** different storage types (disk + tape)
- **1** copy offsite in secure location

### Testing Backups Regularly

```bash
# Verify backup integrity
tar -tzf backup.tar.gz > /dev/null && echo "Backup OK"

# Test restore in isolated environment
# Never restore to production without testing first

# Document restore time objectives (RTO)
# - Production: 1 hour
# - Development: 24 hours
```

## System Recovery Process

### Stage 1: Preparation

1. **Build clean recovery media**
   - Use original installation media
   - Verify media integrity
   - Prepare necessary drivers
   - Have recovery documentation ready

2. **Isolate recovered system**
   - Keep offline network initially
   - Disconnect external connections
   - Prepare network quarantine segment

3. **Document current state**
   - Screenshot error messages
   - Record system configuration
   - Photograph physical setup
   - Note time of recovery start

### Stage 2: System Restoration

```bash
# Option A: Bare Metal Restore
1. Boot from recovery media
2. Run full system restore from backup
3. Verify restored files integrity
4. Test system functionality
5. Check logs for errors

# Option B: Selective File Restore
1. Mount backup storage
2. Copy critical files to clean system
3. Verify file permissions
4. Validate data completeness
5. Update system configurations

# Option C: Fresh Install with Migration
1. Install clean OS from media
2. Install required applications
3. Migrate data from backup
4. Reconfigure system settings
5. Apply security patches
```

## Integrity Verification

### Validate System Files

```bash
# Generate baseline hash of critical files
find /etc /usr/bin /usr/sbin -type f -exec sha256sum {} \; > baseline.txt

# After restore, verify integrity
sha256sum -c baseline.txt

# Check file permissions
ls -la /etc/shadow /etc/passwd

# Verify system binaries
rpm -Va (Red Hat)
debsums -c (Debian)
```

### Application Verification

```bash
# Check application integrity
# Test database connectivity
psql -U user -d database -c "SELECT COUNT(*) FROM users;"

# Verify application services
systemctl status nginx
systemctl status mysql
systemctl status apache2

# Test web application
curl -I https://localhost/
```

## Controlled System Startup

### Boot and Validation Sequence

**Without Network** (Initial checks):

1. Hardware POST check
2. BIOS/UEFI settings verification
3. Disk integrity check
4. System log verification
5. Service startup verification

**With Network Isolation** (Limited network):

1. Enable network to isolated test segment
2. Test domain connectivity
3. Verify DNS resolution
4. Test critical services
5. Monitor System logs for errors

**Network Restoration** (Gradual):

1. Enable network firewall
2. Monitor firewall logs
3. Gradually allow connections
4. Monitor application performance
5. Track system resource usage

### Monitoring During Startup

```bash
# Monitor system logs in real-time
tail -f /var/log/syslog
tail -f /var/log/secure

# Check running processes
ps aux | grep -E "^USER|PID|COMMAND"

# Monitor network connections
netstat -tulpn | grep LISTEN

# Check disk usage
df -h

# Monitor CPU and memory
top -b -n 1 | head -20
```

## Post-Recovery Testing

### Functionality Testing Checklist

- [ ] Operating system boots normally
- [ ] Network connectivity works
- [ ] All services start successfully
- [ ] Applications load and respond
- [ ] Database contains correct data
- [ ] User authentication functions
- [ ] File permissions are correct
- [ ] Backup verification passes
- [ ] Security patches are current
- [ ] Firewall rules are applied

### Performance Baseline

```bash
# Establish new performance baseline
iostat 1 10  # I/O performance
vmstat 1 10  # Virtual memory stats
netstat -s   # Network stats

# Compare with pre-incident baseline
# Document any significant deviations
```

## Incident Lessons Learned

### After-Action Review

**What Happened?**

- Timeline of events
- Detection method and time
- Scope of compromise
- Systems affected

**Why Did It Happen?**

- Vulnerability exploited
- Weak controls that failed
- Process gaps
- Contributing factors

**How Do We Prevent Recurrence?**

- Patch specific vulnerability
- Improve monitoring
- Update security policy
- Enhanced training
- Configuration hardening

**Action Items**

| Item                        | Owner         | Due Date   | Status |
| --------------------------- | ------------- | ---------- | ------ |
| Apply security patch        | Security Team | 2024-01-10 |        |
| Update firewall rules       | Network Team  | 2024-01-12 |        |
| Security awareness training | HR            | 2024-01-20 |        |
| Implement monitoring alert  | SOC           | 2024-01-15 |        |

## Documentation Requirements

Keep detailed records:

- Recovery timeline and duration
- Systems tested and passed
- Anomalies discovered
- Configuration changes made
- Performance baseline
- Lessons learned
- Recommendations

## Real-World Scenario: Hospital System Recovery

**Incident**: Ransomware encrypted patient records system

**Recovery Process**:

1. Restore from daily backup (6 hours old)
2. Verify database integrity (patient data)
3. Check logs for unauthorized access
4. Restore backup to test environment first
5. Validate patient record accuracy
6. Failover to restored system
7. Monitor for 48 hours before declaring recovery complete

**Result**: Service restored in 12 hours with minimal data loss

## Quick Check

1. Its safe to restore a system without testing backup first. **(False - always test)**
2. Lessons learned documentation is optional. **(False - critical for improvement)**
3. Recovery should be tested before an incident occurs. **(True - essential planning)**

## Summary

Successful recovery requires comprehensive planning, regular backup testing, careful verification at each step, and thorough documentation. Post-incident reviews turn crises into opportunities for improvement and resilience building.
