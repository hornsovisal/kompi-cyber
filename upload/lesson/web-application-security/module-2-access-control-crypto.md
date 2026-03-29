# Module 2: Broken Access Control & Cryptographic Failures

## 🎯 Learning Outcomes

By the end of this module, you will:

- Understand access control vulnerabilities and exploitation
- Implement proper authorization mechanisms
- Learn about cryptographic failures and their impact
- Encrypt data properly at rest and in transit
- Recognize and prevent privilege escalation attacks

---

## 📚 Module Overview

| Aspect       | Details                                   |
| ------------ | ----------------------------------------- |
| **Duration** | 2.5 hours                                 |
| **Level**    | Intermediate                              |
| **Focus**    | Authorization, encryption, access control |
| **Tools**    | Browser DevTools, online hash generators  |

---

## Part 1: Broken Access Control (A01:2021)

### What is Access Control?

Access control determines **who** can access **what** resources and in what ways.

**Three Components:**

- **Authentication** - Verify identity (who you are)
- **Authorization** - Determine permissions (what you can do)
- **Audit** - Log access for accountability

### Common Broken Access Control Vulnerabilities

#### 1. Insecure Direct Object References (IDOR)

User can access resources by directly referencing object IDs.

**Vulnerable Code:**

```javascript
app.get("/user/:id/profile", (req, res) => {
  // NO CHECK - any user can request any ID
  User.findById(req.params.id);
});
```

**Attack Example:**

```
GET /user/123/profile → See user 123's data
GET /user/124/profile → See user 124's data (unauthorized!)
```

**Secure Solution:**

```javascript
app.get("/user/:id/profile", authenticate, (req, res) => {
  const requestedId = req.params.id;
  const authenticatedUserId = req.user.id;

  if (requestedId !== authenticatedUserId && !req.user.isAdmin) {
    return res.status(403).send("Forbidden");
  }

  User.findById(requestedId);
});
```

#### 2. Privilege Escalation

Regular users elevate themselves to admin privileges.

**Scenario:**

```
Normal User (id=5) edits their own profile
Intercepts request: POST /admin/user/update
Changes endpoint to: POST /admin/promote-to-admin
Result: User becomes admin
```

**Prevention:**

- Never trust client-provided role parameters
- Always check server-side permissions
- Log permission changes for audit

#### 3. Missing Access Control

No checks on sensitive operations.

```javascript
// VULNERABLE: No check if user is admin
app.post("/admin/delete-user/:userId", (req, res) => {
  User.deleteById(req.params.userId);
});

// SECURE: Explicit admin check
app.post("/admin/delete-user/:userId", requireAdmin, (req, res) => {
  User.deleteById(req.params.userId);
});
```

#### 4. Function-Level Access Control

Admin functions accessible from standard user interface.

```javascript
// VULNERABLE: Anyone can call
app.get("/admin/users-list", (req, res) => {
  res.json(User.getAll());
});

// SECURE: Protected route
app.get("/admin/users-list", authenticate, requireAdmin, (req, res) => {
  res.json(User.getAll());
});
```

### Access Control Matrix (Example)

```
User Types     |  View Profile | Edit Profile | Delete User | Add Admin
--------------|---------------|--------------|-------------|----------
Regular User  |  Own only      | Own only     | Never       | Never
Manager       |  Team members  | Own          | Own team    | Never
Admin         |  All           | All          | All         | Yes
```

---

## Part 2: Cryptographic Failures (A02:2021)

### Why Encryption Matters

**Cryptography protects:**

- Data in transit (HTTPS/TLS)
- Data at rest (database encryption)
- Authentication (password hashing)

### Common Cryptographic Failures

#### 1. Storing Passwords in Plain Text

**Vulnerable:**

```javascript
// NEVER DO THIS
user.password = inputPassword;
user.save(); // Password stored as-is in database
```

**Attack Impact:**

- Database breach = instant account takeover for all users
- One vulnerability = compromise of millions of accounts

**Secure Solution:**

```javascript
const bcrypt = require("bcrypt");

const saltRounds = 10;
const hashedPassword = await bcrypt.hash(inputPassword, saltRounds);
user.password = hashedPassword;
user.save();

// Verification:
const isValid = await bcrypt.compare(inputPassword, user.password);
```

#### 2. Using Weak Encryption Algorithms

**Vulnerable Algorithms:**

- MD5 - Cryptographically broken, 1MB/sec to crack
- SHA-1 - Theoretical vulnerabilities
- DES/3DES - Too short key length

**Secure Algorithms:**

- bcrypt - Password hashing (designed for passwords!)
- Argon2 - Memory-hard password hashing
- PBKDF2 - Key derivation function
- SHA-256 - For general hashing (not passwords)

**Comparison:**

```
Algorithm | Purpose          | Speed    | Security
----------|-----------------|----------|----------
MD5       | Hash            | Fast     | Broken
bcrypt    | Password        | Slow     | Strong
Argon2    | Password        | Very Slow| Strongest
SHA-256   | Data integrity  | Fast     | Good
```

#### 3. Not Encrypting Data in Transit

**Vulnerable:**

```javascript
// HTTP - Data sent in plain text
http://mybank.com/transfer?amount=1000&recipient=attacker
// Network packet contains all details - anyone can read!
```

**Secure:**

```javascript
// HTTPS/TLS - Data encrypted
https://mybank.com/transfer?amount=1000&recipient=attacker
// Network packet is encrypted - eavesdropping impossible
```

#### 4. Exposing Sensitive Data in Error Messages

**Vulnerable:**

```javascript
try {
  accessDatabase();
} catch (error) {
  res.json({
    error: "Database error: " + error.message,
    details: error.stack,
  });
  // Attacker learns: database type, version, file paths, etc.
}
```

**Secure:**

```javascript
try {
  accessDatabase();
} catch (error) {
  console.log("Error details:", error); // Log for debugging
  res.status(500).json({
    error: "An error occurred processing your request",
  });
  // No sensitive information leaked
}
```

#### 5. Hardcoded Cryptographic Keys

**Vulnerable:**

```javascript
const encryption_key = "super_secret_key_12345"; // In source code!
// Anyone with access to code = has encryption key
```

**Secure:**

```javascript
// Use environment variables or secrets vault
const encryption_key = process.env.ENCRYPTION_KEY;
// Or use AWS KMS, HashiCorp Vault, etc.
```

### Encryption Best Practices

1. **Use HTTPS everywhere** - All communication should be encrypted

   ```
   Redirect HTTP → HTTPS
   Use HSTS headers to force HTTPS
   ```

2. **Hash passwords with strong algorithms**

   ```
   ✓ bcrypt, Argon2, scrypt
   ✗ MD5, SHA-1 alone, plain text
   ```

3. **Encrypt sensitive data at rest**

   ```
   Database encryption: MySQL TDE, PostgreSQL pgcrypto
   File encryption: encrypted filesystems
   ```

4. **Use modern TLS versions**

   ```
   Require: TLS 1.2 or 1.3
   Disable: SSL 3.0, TLS 1.0, TLS 1.1
   ```

5. **Protect encryption keys**
   ```
   Never hardcode in source
   Store in secrets vault
   Rotate keys regularly
   Limit access to key material
   ```

---

## Part 3: Real-World Attack Scenarios

### Scenario 1: IDOR Leading to PII Theft

```
Attacker iterates user IDs: /api/user/1/personal-info
Loop from ID 1 to 100000 → Collect all personal data
Result: Name, email, phone, address for entire user base
```

**Prevention:**

- Check authorization on server side
- Use UUIDs instead of sequential IDs (harder to guess)
- Monitor for suspicious access patterns

### Scenario 2: Weak Password = Account Takeover

```
User password: "123456"
Attacker tries: ["123456", "password", "admin", ...]
Takes 2 seconds to guess
→ Account compromised, attacker now admin
```

**Prevention:**

- Enforce strong password policies
- Use bcrypt with adequate salt rounds
- Implement rate limiting on login
- Add 2FA for sensitive accounts

### Scenario 3: Database Breach Exposes Hashes

```
Attacker steals database: 1,000,000 password hashes
Attacker cracks 500,000 weak hashes within days
→ 500,000 account compromises
```

**Prevention:**

- Use strong password hashing (bcrypt, Argon2)
- Longer salt rounds = slower cracking
- Enforce password strength requirements
- Detect and alert on breach attempts

---

## 📊 Access Control Testing Checklist

```
[ ] Can regular user access admin pages?
[ ] Can user modify other user's ID in URL?
[ ] Can user modify their role in request body?
[ ] Does server trust client-provided role/ID?
[ ] Are admin functions in source code/API?
[ ] Can unauthenticated user access protected resources?
[ ] Is authentication checked on every sensitive operation?
[ ] Are permissions checked server-side only?
```

---

## 🧠 Common Mistakes & Solutions

| Mistake              | Risk Level | Solution               |
| -------------------- | ---------- | ---------------------- |
| IDOR vulnerabilities | Critical   | Server-side auth check |
| Plain text passwords | Critical   | Use bcrypt/Argon2      |
| No HTTPS             | High       | Enable TLS/SSL         |
| Client-side auth     | Critical   | Move to server         |
| Weak password policy | High       | Enforce complexity     |
| Exposed API keys     | Critical   | Use secrets vault      |

---

## ✅ Completion Checklist

- [ ] Understand IDOR vulnerabilities and prevention
- [ ] Know the difference between authentication and authorization
- [ ] Understand privilege escalation attacks
- [ ] Know proper password hashing algorithms
- [ ] Understand encryption at rest vs in transit
- [ ] Can identify broken access control in code
- [ ] Understand cryptographic failure definitions
- [ ] Know best practices for key management

---

## 🎓 Summary

**Access Control Golden Rules:**

1. Never trust user input for authorization
2. Always check permissions server-side
3. Use sequential IDs only if access control is verified
4. Log all access to sensitive data

**Cryptography Golden Rules:**

1. Never store passwords in plain text
2. Use HTTPS for all communication
3. Use bcrypt or Argon2 for passwords
4. Protect encryption keys like passwords
5. Encrypt sensitive data at rest
