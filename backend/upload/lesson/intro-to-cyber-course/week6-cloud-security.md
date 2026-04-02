# Week 6: Cloud Security Fundamentals & Misconfiguration Hunting

## 🎯 Learning Outcomes

By the end of this week, you will:

- Understand IaaS, PaaS, and SaaS cloud models
- Apply the Shared Responsibility Model to cloud environments
- Identify common cloud misconfigurations (exposed storage, insecure policies)
- Configure security groups and network policies
- Perform a cloud security assessment
- Remediate cloud misconfigurations

---

## 📚 Module Overview

| Aspect                  | Details                                             |
| ----------------------- | --------------------------------------------------- |
| **Duration**            | 1 week                                              |
| **Practical Labs**      | 2 hands-on AWS/Azure labs                           |
| **Tools**               | AWS S3, AWS SecurityHub, Azure Storage, CloudMapper |
| **Cybersecurity Focus** | Misconfiguration, IAM, Data Exposure                |

---

## Part 1: Cloud Models & Shared Responsibility

### ☁️ Cloud Service Models

```
Traditional On-Premise (You manage everything)
│
├─ IaaS - Infrastructure as a Service
│  └─ Provider manages: Servers, networking, storage
│  └─ You manage: OS, applications, data, access control
│  └─ Example: AWS EC2, Azure VMs, Google Compute Engine
│
├─ PaaS - Platform as a Service
│  └─ Provider manages: Infrastructure + runtime
│  └─ You manage: Applications, data, access control
│  └─ Example: Heroku, AWS Lambda, Google App Engine
│
└─ SaaS - Software as a Service
   └─ Provider manages: Everything (including application)
   └─ You manage: User access, data classification
   └─ Example: Salesforce, Office 365, Slack, GitHub
```

### 🤝 Shared Responsibility Model

```
Control Element      │  On-Premise  │  IaaS  │  PaaS  │  SaaS
─────────────────────┼──────────────┼────────┼────────┼────────
Physical Security    │   You (100%) │  Prov  │  Prov  │  Prov
Network Security     │   You        │  You   │  Prov  │  Prov
Compute              │   You        │  You   │  Prov  │  Prov
Storage              │   You        │  You   │  You   │  Prov
Data                 │   You        │  You   │  You   │  You
Identity & Access    │   You        │  You   │  You*  │  You*

* = Shared responsibility with provider
```

**Key Insight:** Just because data is "in the cloud" doesn't mean the provider is responsible for security. **You must understand your responsibilities.**

---

## Part 2: Common Cloud Misconfigurations

### 🚨 Top Cloud Misconfigurations

| Misconfiguration          | Risk                  | Example                            |
| ------------------------- | --------------------- | ---------------------------------- |
| **Public S3 Bucket**      | Data exposure         | Anyone can list and download files |
| **Overly Permissive IAM** | Privilege escalation  | EC2 instance has admin access      |
| **Unencrypted Storage**   | Data at rest exposure | RDS database without encryption    |
| **Missing Network ACLs**  | Lateral movement      | Database accessible from internet  |
| **Stale API Keys**        | Unauthorized access   | Old credentials not rotated        |
| **Logging Disabled**      | No audit trail        | CloudTrail not enabled             |

---

## Part 3: Practical Lab - Exposing & Fixing Misconfigurations

### 🔧 Lab 1: Public S3 Bucket Exploitation & Remediation

**Objective:** Create a bucket with sensitive data, expose it, and fix the misconfiguration.

**Prerequisites:**

- AWS Free Tier account: https://aws.amazon.com/free
- AWS CLI installed: `pip install awscli`

### 📋 Task 1: Create and Misconfigure an S3 Bucket

```bash
# Set AWS credentials
aws configure
# Enter: Access Key ID, Secret Access Key, Region (us-east-1)

# Create S3 bucket
aws s3 mb s3://my-learning-platform-data-2026

# Create a sample "sensitive" file
echo "Database password: MySecureDB!Pass123" > secret.txt
echo "API Key: sk-proj-abc123xyz789" >> secret.txt

# Upload to S3
aws s3 cp secret.txt s3://my-learning-platform-data-2026/

# Make bucket public (❌ INSECURE)
aws s3api put-bucket-acl \
  --bucket my-learning-platform-data-2026 \
  --acl public-read

# Make all objects public
aws s3api put-bucket-policy \
  --bucket my-learning-platform-data-2026 \
  --policy '{
    "Version": "2012-10-17",
    "Statement": [{
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::my-learning-platform-data-2026/*"
    }]
  }'
```

### 🔓 Task 2: Exploit the Misconfiguration (Show the Risk)

```bash
# Anyone on the internet can now list the bucket and download files
aws s3 ls s3://my-learning-platform-data-2026/

# Output:
# 2026-03-28 14:32:15        156 secret.txt

# Download the secret file
aws s3 cp s3://my-learning-platform-data-2026/secret.txt -

# Output displays:
# Database password: MySecureDB!Pass123
# API Key: sk-proj-abc123xyz789
```

**Impact:** 🚨 Credentials exposed to the entire internet!

### ✅ Task 3: Fix the Misconfiguration

```bash
# Revoke public access
aws s3api put-bucket-acl \
  --bucket my-learning-platform-data-2026 \
  --acl private

# Remove public bucket policy
aws s3api delete-bucket-policy \
  --bucket my-learning-platform-data-2026

# Block public access completely (AWS safeguard)
aws s3api put-public-access-block \
  --bucket my-learning-platform-data-2026 \
  --public-access-block-configuration \
  '{
    "BlockPublicAcls": true,
    "IgnorePublicAcls": true,
    "BlockPublicPolicy": true,
    "RestrictPublicBuckets": true
  }'

# Enable default encryption
aws s3api put-bucket-encryption \
  --bucket my-learning-platform-data-2026 \
  --server-side-encryption-configuration '{
    "Rules": [{
      "ApplyServerSideEncryptionByDefault": {
        "SSEAlgorithm": "AES256"
      }
    }]
  }'
```

### 🔐 Task 4: Verify the Fix

```bash
# Try to access the bucket now (should fail)
aws s3 ls s3://my-learning-platform-data-2026/

# Error: Access Denied
# An error occurred (AccessDenied) when calling the ListBucket

# ✅ SUCCESS! The bucket is now private.
```

---

### 🔧 Lab 2: IAM Over-Privilege Hunting & Remediation

**Objective:** Identify and fix overly permissive IAM policies.

**Scenario:** An EC2 instance has admin access, but only needs to read from S3.

### 📋 Task 1: Identify the Problem

```bash
# List IAM roles
aws iam list-roles --query 'Roles[*].RoleName'

# Get attached policies
aws iam list-attached-role-policies --role-name EC2-Instance-Role

# Result:
# AttachedPolicies:
#   - PolicyName: AdministratorAccess
#     PolicyArn: arn:aws:iam::aws:policy/AdministratorAccess
```

**Problem:** ❌ The EC2 instance has administrator access to **everything**. This violates the Principle of Least Privilege.

### ✅ Task 2: Create a Least Privilege Policy

```bash
# Create a custom policy that only allows S3 read
cat > s3-read-only-policy.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::my-learning-platform-data-2026",
        "arn:aws:s3:::my-learning-platform-data-2026/*"
      ]
    }
  ]
}
EOF

# Attach the new policy
aws iam put-role-policy \
  --role-name EC2-Instance-Role \
  --policy-name S3-ReadOnly \
  --policy-document file://s3-read-only-policy.json

# Remove the admin access
aws iam remove-role-policy \
  --role-name EC2-Instance-Role \
  --policy-name AdministratorAccess
```

### 🔐 Task 3: Verify the Fix

```bash
# The EC2 instance can now:
# ✅ Read from S3
# ✅ List S3 buckets

# But it CANNOT:
# ❌ Delete files
# ❌ Create databases
# ❌ Modify security groups
# ❌ Access other AWS services
```

---

## Part 4: Automated Cloud Security Assessment

### 🔍 Using AWS SecurityHub

1. Enable SecurityHub in your AWS account
2. It automatically scans for:
   - Exposed databases
   - Unencrypted storage
   - Public S3 buckets
   - Overly permissive security groups
   - Unlogged API calls

3. Review findings and remediate

---

## ✅ Completion Checklist

- [ ] Understood IaaS, PaaS, SaaS cloud models
- [ ] Explained the Shared Responsibility Model
- [ ] Created and exposed an S3 bucket
- [ ] Exploited the public bucket misconfiguration
- [ ] Fixed the bucket permissions and encryption
- [ ] Identified over-privileged IAM roles
- [ ] Created a least-privilege policy
- [ ] Verified the security fixes worked
- [ ] Can identify common cloud misconfigurations

**Next Week:** Final project - Comprehensive incident response and security assessment.
