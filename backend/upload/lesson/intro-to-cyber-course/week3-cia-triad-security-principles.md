# Week 3: CIA Triad & Core Security Principles in Practice

## 🎯 Learning Outcomes

By the end of this week, you will:

- Apply the CIA Triad to system design and risk assessment
- Design security controls aligned with CIA principles
- Perform a threat analysis using the CIA framework
- Evaluate existing systems for CIA compliance
- Create a security design document for a real-world scenario

---

## 📚 Module Overview

| Aspect                  | Details                                 |
| ----------------------- | --------------------------------------- |
| **Duration**            | 1 week                                  |
| **Practical Labs**      | 2 case studies                          |
| **Focus**               | System Design Security, Risk Assessment |
| **Cybersecurity Focus** | Defense-in-Depth, Security Architecture |

---

## Part 1: The CIA Triad Framework

### 🔐 The Three Pillars of Information Security

```
              CONFIDENTIALITY
                   ▲
                  /|\
                 / | \
                /  |  \
               /   |   \
        INTEGRITY──┼──AVAILABILITY
              \   |   /
               \  |  /
                \ | /
                 \|/
                  ▼
              TRUST & SECURITY
```

### Definitions & Real-World Impact

#### 1️⃣ **CONFIDENTIALITY** (Keep secrets)

- **Definition:** Only authorized people can access sensitive information
- **Breach Impact:** Data leak, privacy violation, reputation damage
- **Real Example:** T-Mobile data breach (2021) - 54 million customer records exposed

#### 2️⃣ **INTEGRITY** (Prevent tampering)

- **Definition:** Data cannot be modified without authorization
- **Breach Impact:** False/corrupted data, system malfunction, trust loss
- **Real Example:** Equifax breach - not only stolen but potentially modified

#### 3️⃣ **AVAILABILITY** (Ensure access)

- **Definition:** Authorized users can access resources when needed
- **Breach Impact:** Service downtime, business loss, user frustration
- **Real Example:** Colonial Pipeline ransomware (2021) - fuel unavailable for days

---

## Part 2: Designing Controls for Each C in CIA

### 🔧 Lab 1: Securing an Online Banking System

**Scenario:** You are designing the security architecture for a new online banking platform. Apply CIA to every feature.

### 📋 System Features to Secure

| Feature         | Purpose                     | CIA Threat                                                                   |
| --------------- | --------------------------- | ---------------------------------------------------------------------------- |
| Login           | Authenticate users          | Confidentiality (eavesdropping), Integrity (credential theft)                |
| Account Balance | Show user's balance         | Confidentiality (only user should see), Integrity (balance must be accurate) |
| Transfers       | Move money between accounts | Confidentiality + Integrity + Availability (critical)                        |
| Support Chat    | Communicate with bank       | Confidentiality (sensitive info), Integrity (messages not altered)           |

---

### 🔐 Feature 1: Login System

**Threat Model:**

| CIA                 | Threat                | Attack                                            |
| ------------------- | --------------------- | ------------------------------------------------- |
| **Confidentiality** | Password interception | Attacker on same WiFi reads password in cleartext |
| **Integrity**       | Session hijacking     | Attacker steals session cookie, impersonates user |
| **Availability**    | Brute force attack    | Attacker tries 10,000 passwords, locks account    |

**Controls (Defense Layers):**

| Layer              | Control            | Implementation                                   |
| ------------------ | ------------------ | ------------------------------------------------ |
| **Network**        | Encrypt in transit | HTTPS with TLS 1.2+ (never HTTP)                 |
| **Access**         | Rate limiting      | Max 5 login attempts per minute, lock for 15 min |
| **Credential**     | Secure storage     | Hash passwords with bcrypt (salted, iterated)    |
| **Session**        | Secure cookies     | HttpOnly, Secure, SameSite flags                 |
| **Authentication** | 2FA                | SMS or authenticator app (TOTP)                  |

**Code Example (Express.js):**

```javascript
// ❌ INSECURE - Don't do this
app.post("/login", (req, res) => {
  const user = find(req.body.email);
  if (user.password === req.body.password) {
    // Plain-text comparison!
    res.cookie("sessionId", generateToken());
    res.send("Login successful");
  }
});

// ✅ SECURE - Best practice
const bcrypt = require("bcrypt");
const rateLimit = require("express-rate-limit");

const loginLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5, // 5 attempts per minute
  message: "Too many login attempts, try again later",
});

app.post("/login", loginLimiter, async (req, res) => {
  try {
    const user = await User.findByEmail(req.body.email);

    if (!user) {
      return res.status(401).send("Invalid email or password");
    }

    // Compare hashed password (bcrypt handles salt)
    const isValid = await bcrypt.compare(
      req.body.password,
      user.hashedPassword,
    );

    if (!isValid) {
      return res.status(401).send("Invalid email or password");
    }

    // Create secure session
    const sessionToken = generateSecureToken();

    // Set secure cookie (HTTPS only, no JS access)
    res.cookie("sessionId", sessionToken, {
      httpOnly: true, // JavaScript can't access
      secure: true, // HTTPS only
      sameSite: "Strict", // CSRF protection
      maxAge: 3600000, // 1 hour expiry
    });

    // Check if 2FA is enabled
    if (user.twoFactorEnabled) {
      res.status(202).send({ requiresTwoFactor: true });
    } else {
      res.send("Login successful");
    }
  } catch (error) {
    res.status(500).send("Server error"); // Generic error (don't leak info)
  }
});
```

---

### 💰 Feature 2: Account Balance Display

**Threat Model:**

| CIA                 | Threat                   | Attack                                |
| ------------------- | ------------------------ | ------------------------------------- |
| **Confidentiality** | Unauthorized access      | Attacker views another user's balance |
| **Integrity**       | Balance manipulation     | Attacker modifies balance in database |
| **Availability**    | (Lower risk for display) | -                                     |

**Controls:**

1. **Access Control:** Only show balance to the logged-in user
2. **Encryption:** Transmit balance only over HTTPS
3. **Database Integrity:** Use read-only queries, checksums, audit logs

**Code Example:**

```javascript
// ✅ SECURE - Authorization & validation
app.get("/api/account/balance", authenticateToken, async (req, res) => {
  // Verify user is authenticated and get their ID
  const userId = req.user.id;

  // Fetch balance ONLY for the logged-in user
  const account = await Account.findOne({
    userId: userId,
    isActive: true,
  });

  if (!account) {
    return res.status(404).send("Account not found");
  }

  // Return balance (HTTPS encryption happens at transport layer)
  res.json({
    balance: account.balance,
    currency: "USD",
    lastUpdated: account.updatedAt,
  });
});

// Log all balance inquiries for audit trail
app.get("/api/account/balance", authenticateToken, async (req, res) => {
  const userId = req.user.id;

  // Audit log
  await AuditLog.create({
    userId: userId,
    action: "BALANCE_VIEW",
    timestamp: new Date(),
    ipAddress: req.ip,
  });

  // ... rest of code
});
```

---

### 💸 Feature 3: Money Transfer (Most Critical)

**Threat Model (HIGH PRIORITY):**

| CIA                 | Threat                  | Impact       | Likelihood |
| ------------------- | ----------------------- | ------------ | ---------- |
| **Confidentiality** | See transaction history | Moderate     | Medium     |
| **Integrity**       | Change recipient/amount | **CRITICAL** | Medium     |
| **Availability**    | Block transfers         | High         | Low        |

**Controls (Defense-in-Depth):**

| Layer              | Control           | Implementation                  |
| ------------------ | ----------------- | ------------------------------- |
| **Network**        | HTTPS + HSTS      | Encrypt in transit, force HTTPS |
| **Application**    | Input validation  | Validate amounts, recipient IDs |
| **Business Logic** | Approval workflow | Confirm before processing       |
| **Database**       | Transactions      | Atomicity (all-or-nothing)      |
| **Audit**          | Logging           | Log every transaction           |
| **Fraud**          | Anomaly detection | Flag unusual transfers          |

**Code Example (Secure Transfer):**

```javascript
app.post("/api/transfer", authenticateToken, async (req, res) => {
  const session = req.session; // Requires 2FA
  const { recipientId, amount } = req.body;

  // Validation Layer
  if (!Number.isFinite(amount) || amount <= 0) {
    return res.status(400).send("Invalid amount");
  }

  if (amount > 100000) {
    return res.status(400).send("Amount exceeds daily limit");
  }

  // Authorization Layer
  const sender = await User.findById(req.user.id);
  const recipient = await User.findById(recipientId);

  if (!recipient) {
    return res.status(404).send("Recipient not found");
  }

  if (sender.balance < amount) {
    return res.status(400).send("Insufficient funds");
  }

  // Anomaly Detection
  const unusualTransfer = await isUnusualTransfer(
    sender.id,
    amount,
    recipientId,
  );
  if (unusualTransfer) {
    // Require additional confirmation
    await sendVerificationCode(sender.email);
    return res.status(202).send({
      requiresVerification: true,
      message: "Unusual activity detected. Verification code sent.",
    });
  }

  // Database Transaction (Atomic)
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Debit sender
    await connection.query(
      "UPDATE accounts SET balance = balance - ? WHERE userId = ?",
      [amount, sender.id],
    );

    // Credit recipient
    await connection.query(
      "UPDATE accounts SET balance = balance + ? WHERE userId = ?",
      [amount, recipient.id],
    );

    // Record transaction
    const transfer = await connection.query(
      "INSERT INTO transfers (senderId, recipientId, amount, timestamp) VALUES (?, ?, ?, ?)",
      [sender.id, recipientId, amount, new Date()],
    );

    // Audit log
    await AuditLog.create({
      userId: sender.id,
      action: "TRANSFER_SENT",
      details: { amount, recipientId, transferId: transfer.id },
      timestamp: new Date(),
    });

    await connection.commit();
    res.send({ success: true, transferId: transfer.id });
  } catch (error) {
    await connection.rollback();
    res.status(500).send("Transfer failed, balance restored");
  } finally {
    connection.release();
  }
});
```

---

## Part 3: Risk Assessment Using CIA

### 🔍 Lab 2: Threat Analysis Exercise

**Scenario:** A healthcare clinic is storing patient medical records in a cloud database.

**Task:** Identify threats to each component of CIA and recommend controls.

### 📋 Risk Register Template

```
THREAT ANALYSIS: Patient Medical Records System
Healthcare Clinic - March 2026

┌─────────────────────────────────────────────────────┐
│ THREAT 1: Unauthorized Access to Patient Records    │
├─────────────────────────────────────────────────────┤
│ CIA Affected: CONFIDENTIALITY                       │
│ Likelihood: HIGH (3/5)                              │
│ Impact: CRITICAL (5/5)                              │
│ Risk Score: 15/25 (HIGH)                            │
│                                                     │
│ Attack Vector: Weak password, credential reuse      │
│                                                     │
│ Controls:                                           │
│ 1. Multi-factor authentication (MFA)                │
│ 2. Role-based access control (RBAC)                 │
│ 3. Encryption at rest (AES-256)                     │
│ 4. Encryption in transit (TLS 1.2+)                 │
│ 5. Access logging & monitoring                      │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ THREAT 2: Data Corruption by Malware                │
├─────────────────────────────────────────────────────┤
│ CIA Affected: INTEGRITY                             │
│ Likelihood: MEDIUM (3/5)                            │
│ Impact: CRITICAL (5/5)                              │
│ Risk Score: 15/25 (HIGH)                            │
│                                                     │
│ Controls:                                           │
│ 1. Database backups (hourly snapshots)              │
│ 2. Version control for records                      │
│ 3. Ransomware protection tools                      │
│ 4. File integrity monitoring (FIM)                  │
│ 5. Regular backups to offline storage               │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ THREAT 3: Service Downtime (DDoS)                   │
├─────────────────────────────────────────────────────┤
│ CIA Affected: AVAILABILITY                          │
│ Likelihood: LOW (2/5)                               │
│ Impact: HIGH (4/5)                                  │
│ Risk Score: 8/25 (MEDIUM)                           │
│                                                     │
│ Controls:                                           │
│ 1. DDoS mitigation service (CloudFlare, AWS Shield) │
│ 2. Load balancing & auto-scaling                    │
│ 3. Redundant database replicas                      │
│ 4. Disaster recovery plan (RTO/RPO defined)         │
└─────────────────────────────────────────────────────┘
```

---

## 🎓 Key Concepts

| Concept              | Definition                                              | Example                                  |
| -------------------- | ------------------------------------------------------- | ---------------------------------------- |
| **CIA Triad**        | Confidentiality, Integrity, Availability framework      | Design all security controls around CIA  |
| **Defense-in-Depth** | Multiple security layers; if one fails, others catch it | HTTPS + FW + IDS + EDR                   |
| **Risk**             | Likelihood × Impact                                     | High impact + high likelihood = must fix |
| **Control**          | A measure to reduce risk                                | Encryption, MFA, logging                 |

---

## ✅ Completion Checklist

- [ ] Understood CIA Triad and its importance
- [ ] Designed security controls for login system
- [ ] Designed controls for account balance display
- [ ] Designed controls for money transfer (most critical)
- [ ] Completed threat analysis for healthcare scenario
- [ ] Created a risk register with threat ratings
- [ ] Can map vulnerabilities to CIA violations

**Next Week:** Identity & Access Management - practical implementation of authentication and authorization systems.
