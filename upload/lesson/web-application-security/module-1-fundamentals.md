# Module 1: Web Application Security Fundamentals

## 🎯 Learning Outcomes

By the end of this module, you will:

- Understand web application architecture and trust boundaries
- Identify common web vulnerabilities and attack vectors
- Learn security principles for web development
- Recognize the importance of secure coding practices
- Understand the role of OWASP in web security

---

## 📚 Module Overview

| Aspect       | Details                                                |
| ------------ | ------------------------------------------------------ |
| **Duration** | 2 hours                                                |
| **Level**    | Intermediate                                           |
| **Focus**    | Web architecture, threat modeling, security principles |
| **Tools**    | Browser DevTools, OWASP Top 10                         |

---

## Part 1: Web Application Architecture

### Core Components

A typical web application consists of:

- **Client Layer** - Browser or mobile app where users interact
- **Web Server** - Handles HTTP requests and responses
- **Application Logic** - Business logic and data processing
- **Database** - Persistent data storage
- **APIs & Services** - Third-party integrations and microservices

### Trust Boundaries

Security decisions must be enforced at trust boundaries:

```
[Untrusted User Input]
        ↓
   [Web Server] ← Critical boundary
        ↓
[Backend Services] ← Second boundary
        ↓
   [Database] ← Third boundary
```

**Key Rule:** Never trust user input. Always validate and sanitize.

### Common Risk Areas

- **Weak input validation** - Accepting malicious data
- **Insecure session management** - Predictable or stolen tokens
- **Direct object references** - Accessing unauthorized resources
- **Security misconfiguration** - Default credentials, exposed settings
- **Insufficient logging** - Can't detect or investigate attacks

---

## Part 2: Threat Modeling for Web Apps

### Security Threats Matrix

| Threat Category    | Example                           | Impact                         |
| ------------------ | --------------------------------- | ------------------------------ |
| **Injection**      | SQL injection, command injection  | Data breach, system compromise |
| **Authentication** | Weak passwords, session hijacking | Unauthorized access            |
| **Authorization**  | Broken access control             | Privilege escalation           |
| **Data Exposure**  | Unencrypted transmission          | Data theft                     |
| **Business Logic** | Race conditions, workflow bypass  | Financial loss                 |

### Attack Vectors for Web Apps

1. **Direct Input** - For forms, search bars, file uploads
2. **API Requests** - Manipulated POST/GET parameters
3. **Session Tokens** - Cookie theft, CSRF attacks
4. **Error Messages** - Information leakage
5. **Default Credentials** - Admin panels left unsecured

### Defense-in-Depth Approach

```
Layer 1: Network Security (WAF, DDoS protection)
    ↓
Layer 2: Authentication & Authorization
    ↓
Layer 3: Input Validation & Sanitization
    ↓
Layer 4: Encryption & Secure Transport (TLS)
    ↓
Layer 5: Logging & Monitoring
    ↓
Layer 6: Incident Response
```

---

## Part 3: OWASP Framework

### What is OWASP?

**Open Web Application Security Project** is a non-profit organization dedicated to improving web application security.

### OWASP Top 10 2021

The 10 most critical web application security risks:

1. **Broken Access Control** (A01:2021)
2. **Cryptographic Failures** (A02:2021)
3. **Injection** (A03:2021)
4. **Insecure Design** (A04:2021)
5. **Security Misconfiguration** (A05:2021)
6. **Vulnerable and Outdated Components** (A06:2021)
7. **Identification and Authentication Failures** (A07:2021)
8. **Software and Data Integrity Failures** (A08:2021)
9. **Logging and Monitoring Failures** (A09:2021)
10. **Server-Side Request Forgery** (A10:2021)

### Using OWASP in Development

- **Design Phase** - Map features to OWASP risks
- **Development** - Follow secure coding guidelines
- **Testing** - Include security tests alongside functional tests
- **Deployment** - Secure configuration and hardening
- **Operations** - Monitor and log continuously

---

## Part 4: Security Principles

### CIA Triad for Web Applications

**Confidentiality** - Encrypt sensitive data at rest and in transit

- Use HTTPS/TLS for all communications
- Encrypt passwords with strong algorithms
- Implement proper access controls

**Integrity** - Ensure data cannot be tampered with

- Use cryptographic signatures
- Implement checksums and hashing
- Validate data on both client and server

**Availability** - Ensure systems are accessible when needed

- Implement rate limiting to prevent abuse
- Use load balancing for resilience
- Have incident response plans

### Secure Development Lifecycle (SDL)

```
Plan & Design → Develop → Test → Deploy → Monitor
    ↓             ↓        ↓        ↓        ↓
Threat Model  Code Review Security Deploy Hardened Logging
                Secure Code Testing  Config   Monitoring
```

### Key Security Principles

1. **Principle of Least Privilege** - Users get minimal required permissions
2. **Defense in Depth** - Multiple layers of security controls
3. **Fail Secure** - Default to secure state on failure
4. **Separation of Concerns** - Isolated components reduce blast radius
5. **Complete Mediation** - Check authorization on every access

---

## 🧠 Common Mistakes & How to Avoid Them

| Mistake                          | Impact                       | Solution                                 |
| -------------------------------- | ---------------------------- | ---------------------------------------- |
| Storing passwords in plain text  | Complete identity compromise | Use bcrypt, Argon2, scrypt               |
| Using HTTP without encryption    | Network-level data theft     | Always use HTTPS                         |
| Trusting user input directly     | Injection attacks            | Validate and sanitize all input          |
| Hard-coded credentials           | Easy compromise              | Use environment variables, secrets vault |
| Disabled authentication on debug | Unauthorized access          | Never disable security for convenience   |

---

## 📚 Further Reading

**OWASP Resources:**

- OWASP Top 10: https://owasp.org/Top10/
- OWASP Testing Guide: https://owasp.org/www-project-web-security-testing-guide/
- OWASP Secure Coding Practices: https://owasp.org/www-project-secure-coding-practices-quick-reference-guide/

**Standards:**

- CWE Top 25: Most dangerous weaknesses
- CVSS Score: Vulnerability severity rating
- SANS Top 25: Software weakness list

---

## ✅ Completion Checklist

- [ ] Understand web application architecture and components
- [ ] Identify trust boundaries in your applications
- [ ] Know the OWASP Top 10 rankings
- [ ] Understand threat modeling concepts
- [ ] Recognize common attack vectors
- [ ] Know the defense-in-depth principle
- [ ] Understand CIA triad in context of web apps
- [ ] Can explain principle of least privilege

---

## 🎓 Key Takeaways

1. **Web apps combine multiple security challenges** - servers, clients, databases, networks all need protection
2. **OWASP Top 10 guides priority** - focus on most critical risks first
3. **Threat modeling is essential** - understand your architecture before securing it
4. **Defense in depth is necessary** - single controls always fail eventually
5. **Security is not optional** - it's part of the development lifecycle from day one
