# Module 3: Injection & Insecure Design

## 🎯 Learning Outcomes

By the end of this module, you will:

- Understand injection vulnerabilities and exploitation
- Prevent SQL injection, command injection, and code injection
- Understand insecure design vulnerabilities
- Implement threat modeling and secure design principles
- Create security-by-design applications

---

## 📚 Module Overview

| Aspect       | Details                                          |
| ------------ | ------------------------------------------------ |
| **Duration** | 2.5 hours                                        |
| **Level**    | Intermediate                                     |
| **Focus**    | Injection attacks, design flaws, threat modeling |
| **Tools**    | SQL, parameterized queries, design tools         |

---

## Part 1: Injection Vulnerabilities (A03:2021)

### What is Injection?

Injection occurs when untrusted data is sent to an interpreter as part of a command or query.

**Attack Flow:**

```
User Input → Application → Command/Query → Interpreter
                ↓ No validation/sanitization
          Attacker can modify command behavior
```

### SQL Injection (Most Common)

#### Vulnerable Code Example

```javascript
// VULNERABLE: String concatenation
app.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  const query =
    "SELECT * FROM users WHERE username='" +
    username +
    "' AND password='" +
    password +
    "'";
  db.execute(query);
});
```

#### Attack Example

```
Username: admin' --
Password: anything

Query becomes:
  SELECT * FROM users WHERE username='admin' --' AND password='anything'

The -- comments out the password check!
Result: Login as admin without password
```

#### Secure Solution

```javascript
// SECURE: Parameterized queries
app.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  const query = "SELECT * FROM users WHERE username=? AND password=?";
  db.execute(query, [username, password]);
  // Database driver escapes values automatically
});
```

### SQL Injection Attack Scenarios

#### Scenario 1: Authentication Bypass

```sql
Input: admin' --
Query: SELECT * FROM users WHERE username='admin' --' AND pass='...'
Result: Logs in as admin without password
```

#### Scenario 2: Data Extraction

```sql
Input: ' OR '1'='1
Query: SELECT * FROM users WHERE id='1' OR '1'='1'
Result: Returns ALL users instead of one
```

#### Scenario 3: Data Modification

```sql
Input: '; DROP TABLE users; --
Query: SELECT * FROM users WHERE id=123; DROP TABLE users; --
Result: Deletes entire users table (if permissions allow)
```

### Command Injection

When user input is passed to system commands.

```javascript
// VULNERABLE
app.get("/ping", (req, res) => {
  const host = req.query.host;
  const result = exec(`ping -c 4 ${host}`);
  res.send(result);
});
```

**Attack:**

```
Input: localhost; rm -rf /
Command: ping -c 4 localhost; rm -rf /
Result: Deletes system files!
```

**Secure Solution:**

```javascript
// SECURE: Use library functions
app.get("/ping", (req, res) => {
  const host = req.query.host;

  // Validate input
  if (!/^[a-zA-Z0-9.-]+$/.test(host)) {
    return res.status(400).send("Invalid host");
  }

  // Use ping library instead of shell command
  ping.promise.probe(host).then((res) => {
    res.send(res);
  });
});
```

### Other Injection Types

| Type           | Target             | Example            | Impact               |
| -------------- | ------------------ | ------------------ | -------------------- |
| **LDAP**       | Directory services | Filter bypass      | Policy circumvention |
| **XPath**      | XML data           | Query bypass       | Data extraction      |
| **NoSQL**      | Document databases | Query manipulation | Data breach          |
| **OS Command** | System commands    | Arbitrary commands | System compromise    |
| **Code/Eval**  | Code interpreter   | Arbitrary code     | Complete takeover    |

### Prevention Summary

**The Golden Rule:** Use parameterized queries/prepared statements.

```javascript
// ✓ SAFE - Parameterized
db.query("SELECT * FROM users WHERE id=?", [userId]);

// ✓ SAFE - ORM (abstraction)
User.findById(userId);

// ✓ SAFE - Input validation + escaping
const safe = escapeSQL(userInput);

// ✗ UNSAFE - String concatenation
db.query("SELECT * FROM users WHERE id=" + userId);

// ✗ UNSAFE - Simple escaping only
db.query("SELECT * FROM users WHERE id='" + escape(userId) + "'");
```

---

## Part 2: Insecure Design (A04:2021)

### What is Insecure Design?

Threats are not addressed during architecture and design phases due to absence of threat modeling.

**Difference:**

```
Insecure Design    = Flaws in architecture/design
Implementation Bug = Mistake in coding the design

Both are vulnerabilities, but design flaws are harder to fix
```

### Threat Modeling Process

#### Step 1: Identify Assets

```
What needs protection?
- User data (PII, payment info)
- Authentication tokens
- Admin credentials
- Business logic
- Intellectual property
```

#### Step 2: Identify Threats

```
Who are attackers?
- External attackers (hackers)
- Competitors
- Disgruntled employees
- Careless users

What are their goals?
- Steal data
- Disrupt service
- Gain unauthorized access
- Financial fraud
```

#### Step 3: Identify Vulnerabilities

```
How can threats exploit systems?
- OWASP Top 10 risks
- Missing security controls
- Weak authentication
- Unencrypted data
- Poor error handling
```

#### Step 4: Implement Controls

```
What security measures needed?
- Access control
- Encryption
- Input validation
- Rate limiting
- Logging & monitoring
```

### Design Flaws Examples

#### Example 1: Password Reset Design Flaw

```
VULNERABLE DESIGN:
1. User clicks "Forgot Password"
2. System sends reset link via email
3. Link contains user ID: /reset?userId=123
4. Attacker changes to userId=124 → resets other user's password

SECURE DESIGN:
1. Generate unique, temporary token
2. Send in reset link: /reset?token=random_128_char_token
3. Token only valid for 15 minutes
4. Token tied to user in database (not guessable from URL)
```

#### Example 2: Rate Limiting Design

```
VULNERABLE:
- No limit on password attempts
- Attacker can try unlimited passwords
- Weak passwords = minutes to crack

SECURE DESIGN:
- Limit login attempts: 5 attempts per 15 minutes
- Exponential backoff: 1 sec, 2 sec, 4 sec, 8 sec...
- Lockout: 30 minutes after repeated failures
- Alert: Email to account owner on suspicious activity
```

#### Example 3: API Rate Limiting

```
VULNERABLE:
- No rate limits on API calls
- Attacker scrapes entire user database
- Attacker causes denial of service

SECURE DESIGN:
- Rate limit: 100 requests per minute per user
- Burst allowance: 10 requests per second
- Block IPs exceeding limits
- Different limits for different operations (write slower than read)
```

### Secure Design Principles

#### 1. Secure by Default

```
✓ Default to most secure settings
✓ Require explicit action to disable security
✓ Default to deny access (whitelist approach)

✗ Default to least secure (blacklist approach)
✗ Users have to enable security manually
```

#### 2. Assuming Breach

```
Design as if attackers will eventually break in

Questions to ask:
- Can attacker cause harm if they get database password?
- Can single credential compromise the system?
- Can attacker see other users' data?
- How quickly can we detect the breach?
- How fast can we shut down attacker's access?
```

#### 3. Security Architecture

```
Defense in Depth:
  Browser ← TLS/HTTPS ← API Server ← Authentication ← Database

Each layer independent:
- Breach in one doesn't automatically compromise others
- Multiple layers slow down attackers
- Easier to isolate and remediate
```

#### 4. Principle of Least Privilege (Design Level)

```
User Account Privileges:
- Front-end user: read products, view own account
- Staff: manage inventory, process orders
- Admin: manage staff, system configuration
- DB user (app): only SELECT/INSERT/UPDATE on needed tables
- DB admin: full access (keep separate from app account)
```

### Design Review Checklist

```
[ ] Have we identified all assets needing protection?
[ ] Have we performed threat modeling?
[ ] Are security requirements documented?
[ ] Is authentication properly designed?
[ ] Are authorization rules clear?
[ ] Is data encrypted in transit and at rest?
[ ] Are we logging security events?
[ ] Can we detect and respond to breaches?
[ ] Have we tested failure scenarios?
[ ] Is security architecture documented?
```

---

## Part 3: Fixing Injection Vulnerabilities

### Input Validation

Always validate on server-side:

```javascript
// VALIDATE FORMAT
function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regex.test(email)) {
    throw new Error("Invalid email format");
  }
}

// VALIDATE LENGTH
function validateUsername(username) {
  if (username.length < 3 || username.length > 20) {
    throw new Error("Username must be 3-20 characters");
  }
}

// VALIDATE TYPE
function validateUserId(id) {
  const numId = parseInt(id);
  if (isNaN(numId) || numId <= 0) {
    throw new Error("Invalid user ID");
  }
  return numId;
}

// VALIDATE WHITELIST
const allowedSortFields = ["name", "email", "created_at"];
function validateSortField(field) {
  if (!allowedSortFields.includes(field)) {
    throw new Error("Invalid sort field");
  }
}
```

### Query Protection Strategies

```javascript
// STRATEGY 1: Prepared Statements (Best)
const result = await db.query("SELECT * FROM users WHERE email = ?", [
  userEmail,
]);

// STRATEGY 2: ORM/Query Builders (Good)
const user = await User.where({ email: userEmail }).findOne();

// STRATEGY 3: Escaping (Last Resort)
const safe = mysql.escape(userInput);
// Still vulnerable if used with like: LIKE '%' + safe + '%'
```

---

## 🧠 Common Mistakes & Solutions

| Mistake                    | Risk     | Solution                          |
| -------------------------- | -------- | --------------------------------- |
| SQL concatenation          | Critical | Use parameterized queries         |
| Trusting client validation | High     | Always validate server-side       |
| No input length limits     | Medium   | Enforce reasonable limits         |
| Generic error messages     | Medium   | Don't expose database details     |
| Disabled security in dev   | Medium   | Same security in all environments |

---

## ✅ Completion Checklist

- [ ] Understand SQL injection mechanisms and prevention
- [ ] Know other injection types (command, LDAP, code)
- [ ] Can identify injection vulnerabilities in code
- [ ] Understand threat modeling process
- [ ] Know principles of secure design
- [ ] Can conduct basic design review
- [ ] Understand defense in depth
- [ ] Know parameterized query implementation

---

## 🎓 Key Takeaways

**Injection Prevention Golden Rules:**

1. **Never trust user input** - Always validate and parameterize
2. **Use prepared statements** - Let database driver handle escaping
3. **Whitelist > Blacklist** - Know what's allowed, not what's forbidden
4. **Defense in depth** - Multiple layers catch different attacks

**Secure Design Golden Rules:**

1. **Threat model before building** - Understand attacks you're protecting against
2. **Secure by default** - Users shouldn't have to opt-in to security
3. **Assume breach** - Design assuming attackers will eventually get in
4. **Test threat scenarios** - Don't just test happy path
