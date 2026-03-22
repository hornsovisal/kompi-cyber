# Module 7: Cloud Security Fundamentals

## Learning Objectives

- Understand cloud security models and responsibilities
- Identify cloud-specific security threats
- Implement cloud security best practices
- Secure cloud infrastructure and data
- Monitor and audit cloud resources

## Cloud Service Models

### Infrastructure as a Service (IaaS)

**Definition**: Virtualized computing over the internet

- Examples: AWS EC2, Azure VMs, Google Compute Engine
- You manage: Applications, data, runtime, middleware
- Provider manages: OS, virtualization, servers, storage

**Security Considerations**:

- Virtual machine hardening
- Network security groups
- Access control to instances
- Resource encryption

### Platform as a Service (PaaS)

**Definition**: Development and deployment platform

- Examples: Heroku, AWS Lambda, Google App Engine
- You manage: Applications, data
- Provider manages: Infrastructure, middleware, runtime

**Security Considerations**:

- Application-level security
- Data encryption in transit
- API security
- Code scanning

### Software as a Service (SaaS)

**Definition**: Cloud-hosted applications

- Examples: Office 365, Salesforce, Slack
- You manage: User access, data configuration
- Provider manages: Everything else

**Security Considerations**:

- User authentication
- Data classification
- Access control
- Compliance requirements

## Shared Responsibility Model

```
CUSTOMER RESPONSIBILITY          AWS RESPONSIBILITY
════════════════════════════════════════════════════════

Client-side encryption          Physical security
Server-side encryption          Network filtering
IAM policies                     Hypervisor security
OS patching                      Storage encryption
Application security            Database patches
Network configuration           DDoS protection
Firewall rules                   Service availability
Monitoring & logging            Region/AZ isolation
```

## Cloud Security Best Practices

### 1. Identity and Access Management (IAM)

```yaml
Principle of Least Privilege:
  - Grant minimum permissions needed
  - Use role-based access control (RBAC)
  - Enable multi-factor authentication
  - Regular access reviews
  - Remove unused accounts

# AWS IAM Example
Resource: "arn:aws:s3:::my-bucket/*"
Principal: AWS:arn:aws:iam::123456789:role/Lambda
Effect: Allow
Action: "s3:GetObject"
Condition:
  StringEquals:
    aws:SourceVpc: "vpc-12345678"
```

### 2. Data Protection

```markdown
# In Transit

- Use HTTPS/TLS for all connections
- Encrypt VPN traffic
- Certificate pinning for mobile apps
- Secure headers (HSTS, CSP)

# At Rest

- Enable encryption for:
  - Databases (RDS encryption)
  - Object storage (S3 encryption)
  - EBS volumes (EBS encryption)
- Use customer-managed encryption keys
- Secure key management with HSM

# In Use

- Confidential computing
- Secure enclaves
- Memory encryption
```

### 3. Network Security

```bash
# Security Groups (AWS)
# Allow only necessary traffic
Inbound Rules:
- SSH (22): From admin IP only
- HTTP (80): From 0.0.0.0/0
- HTTPS (443): From 0.0.0.0/0

# Network ACLs for subnet-level filtering
# VPC Endpoint for private AWS service access
# Site-to-Site VPN for secure connections

# Diagram: Public/Private Subnet Architecture
[Internet Gateway]
        ↓
[Public Subnet: NAT/Bastion]
        ↓
[Private Subnet: Databases/Sensitive]
```

### 4. Logging and Monitoring

```bash
# Enable comprehensive logging
- CloudTrail for API calls (AWS)
- VPC Flow Logs for network traffic
- Application logs to CloudWatch
- S3 access logs
- Database audit logs

# Set up alerts for:
- Unauthorized API calls
- Policy changes
- Failed login attempts
- Unusual data access patterns
- Resource creation/deletion
```

## Cloud-Specific Threats

### Misconfiguration

**Risk**: Public S3 buckets, open security groups

```bash
# Check for public access
aws s3api get-bucket-acl --bucket my-bucket

# Audit security groups
aws ec2 describe-security-groups --query 'SecurityGroups[?IpPermissions[?IpRanges[?CidrIp==`0.0.0.0/0`]]]'

# Fix: Deny public access
aws s3api put-public-access-block \
  --bucket my-bucket \
  --public-access-block-configuration BlockPublicAcls=true,IgnorePublicAcls=true
```

### Compromised Credentials

**Prevention**:

- Rotate access keys regularly
- Use temporary credentials (STS)
- Monitor credential usage
- Implement credential scanning
- Use secrets management (AWS Secrets Manager)

### Insecure API Access

**Security Measures**:

- API authentication (API keys, OAuth)
- Rate limiting
- IP whitelisting
- VPC endpoints
- WAF rules

### Inadequate Access Control

**Implementation**:

- IAM policies reviewed quarterly
- MFA for human access
- Service-to-service authentication
- Cross-account access audit
- Resource-based policies

## Infrastructure as Code (IaC) Security

```yaml
# Terraform Example - Secure S3 Bucket
resource "aws_s3_bucket" "secure_bucket" {
bucket = "my-secure-bucket"
}

resource "aws_s3_bucket_versioning" "example" {
bucket = aws_s3_bucket.secure_bucket.id
versioning_configuration {
status = "Enabled"
}
}

resource "aws_s3_bucket_server_side_encryption_configuration" "example" {
bucket = aws_s3_bucket.secure_bucket.id

rule {
apply_server_side_encryption_by_default {
sse_algorithm = "AES256"
}
}
}

resource "aws_s3_bucket_public_access_block" "example" {
bucket = aws_s3_bucket.secure_bucket.id

block_public_acls       = true
block_public_policy     = true
ignore_public_acls      = true
restrict_public_buckets = true
}
```

## Real-World Scenario: Securing a Web Application in AWS

**Architecture**:

- Frontend in CloudFront (CDN)
- Backend API on EC2 in private subnet
- RDS PostgreSQL database
- S3 for static assets

**Security Implementation**:

1. **Network**
   - Public subnet: NAT Gateway
   - Private subnet: EC2 instances
   - VPC endpoint for S3
   - Security groups restrict traffic

2. **Application**
   - WAF on CloudFront
   - ALB with HTTPS
   - Application hardening
   - Input validation

3. **Database**
   - RDS encryption enabled
   - VPC security group restrictions
   - Regular automated backups
   - Automated patches

4. **Data**
   - S3 versioning enabled
   - Encryption at rest
   - Public access blocked
   - CloudTrail logging

5. **Monitoring**
   - CloudWatch dashboards
   - CloudTrail logging
   - VPC Flow Logs
   - Security Hub alerts

## Compliance and Governance

**Common Cloud Certifications**:

- SOC 2 Type II
- ISO 27001
- PCI DSS
- HIPAA
- GDPR

**Verification**:

- Regular security posture assessments
- Penetration testing
- Vulnerable assessment scanning
- Compliance reporting

## Quick Check

1. Cloud providers handle all security responsibility in SaaS. **(False - shared responsibility)**
2. Logging and monitoring are essential for cloud security. **(True)**
3. IAM roles should grant broad permissions for flexibility. **(False - least privilege)**

## Summary

Cloud security requires understanding shared responsibility, implementing IAM controls, protecting data at all stages, securing network architecture, and maintaining comprehensive monitoring. Regular audits and compliance checks ensure security posture remains strong as cloud environments evolve.
