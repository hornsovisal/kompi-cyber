# Week 4: Identity & Access Management (IAM) - Practical Implementation

## 🎯 Learning Outcomes

By the end of this week, you will:

- Implement multi-factor authentication (MFA) on real systems
- Audit and enforce password policies on Linux systems
- Understand role-based access control (RBAC) and principle of least privilege
- Configure secure access controls in applications
- Detect and respond to unauthorized access attempts

---

## 📚 Module Overview

| Aspect                  | Details                                            |
| ----------------------- | -------------------------------------------------- |
| **Duration**            | 1 week                                             |
| **Practical Labs**      | 3 hands-on labs                                    |
| **Tools**               | Linux (`chage`, `pam`), GitHub, Authenticator apps |
| **Cybersecurity Focus** | **A01: Broken Access Control**, Authentication     |

---

## Part 1: Linux Password Policy Hardening

### 🔧 Lab 1: Enforcing Strong Password Policies

**Objective:** Configure your Linux system to enforce strong password policies.

**Why This Matters:** Weak passwords are the #1 cause of account compromise. 90% of breaches involve weak credentials.

### 📋 Tasks

**Task 1: Check Current Password Policy**

```bash
# View current settings
sudo cat /etc/login.defs | grep PASS

# Output example:
# PASS_MAX_DAYS   99999   # Max days password valid
# PASS_MIN_DAYS   0       # Min days before change allowed
# PASS_MIN_LEN    5       # Minimum password length (WEAK!)
# PASS_WARN_AGE   7       # Days to warn before expiry
```

**Current Status:** ❌ **INSECURE** - Passwords only require 5 characters!

**Task 2: Install PAM Cracklib (Password Quality Checker)**

```bash
sudo apt-get update
sudo apt-get install libpam-cracklib
```

**What it does:** Prevents weak passwords by checking against password dictionaries.

**Task 3: Configure Strong Password Requirements**

Edit `/etc/pam.d/common-password`:

```bash
sudo nano /etc/pam.d/common-password
```

Find this line:

```
password    requisite        pam_cracklib.so retry=3 minlen=6
```

Replace with:

```
password    requisite        pam_cracklib.so retry=3 minlen=12 \
    dcredit=-1 ucredit=-1 ocredit=-1 lcredit=-1
```

**What this means:**

- `minlen=12` - Minimum 12 characters
- `dcredit=-1` - At least 1 digit required
- `ucredit=-1` - At least 1 uppercase letter
- `ocredit=-1` - At least 1 special character
- `lcredit=-1` - At least 1 lowercase letter

**Task 4: Update Login Configuration**

Edit `/etc/login.defs`:

```bash
sudo nano /etc/login.defs
```

Update these lines:

```bash
PASS_MAX_DAYS   90      # Change password every 90 days
PASS_MIN_DAYS   1       # Can't change password until 1 day passes
PASS_MIN_LEN    12      # Minimum 12 characters
PASS_WARN_AGE   14      # Warn 14 days before expiry
```

**Task 5: Test the Policy**

```bash
# Try to set a weak password
passwd myuser

# System will reject: "Bad password: Is too simple"

# Set a strong password
# New password: MySecure!Pass2026
# Re-enter: MySecure!Pass2026
# passwd: password updated successfully
```

**Expected Outcome:** ✅ System accepts only strong passwords.

---

## Part 2: Multi-Factor Authentication (MFA)

### 🔒 Lab 2: Setting Up 2FA on GitHub (Real-World Practice)

**Objective:** Implement and test two-factor authentication.

**Why This Matters:** Even with a strong password, MFA is essential. 99.9% of account takeovers are prevented with MFA.

### 📋 Setup Steps

**Task 1: Enable 2FA on GitHub**

1. Go to GitHub → Settings → Account Security
2. Click "Enable two-factor authentication"
3. Choose authentication method:
   - **SMS** (less secure, convenient)
   - **TOTP** (more secure, uses authenticator app)

**Task 2: Set Up Time-Based One-Time Password (TOTP)**

1. Download an authenticator app:
   - Google Authenticator (Android/iOS)
   - Microsoft Authenticator
   - Authy

2. Scan the QR code provided by GitHub
3. Enter the 6-digit code from your app
4. GitHub confirms: "Two-factor authentication enabled"

**Task 3: Back Up Recovery Codes**

GitHub provides 10 recovery codes. **SAVE THESE SAFELY!**

```
Example Recovery Codes:
1a2b-3c4d-5e6f
7g8h-9i0j-1k2l
... (8 more)
```

⚠️ **If you lose access to your authenticator app, these codes are your only way to regain access.**

**Task 4: Test 2FA Login**

1. Log out of GitHub
2. Log back in with username + password
3. GitHub asks: "Enter your authentication code"
4. Enter code from authenticator app
5. **Success!** You're logged in.

### 🧠 How 2FA Works (Behind the Scenes)

```
┌──────────────┐
│   1. Login   │
│ email + pwd  │
└──────┬───────┘
       │
       ▼
┌──────────────────────┐
│  Password correct?   │
│  (Server validates)  │
└──────┬───────────────┘
       │
       ▼ YES
┌──────────────────────┐
│  Send 6-digit code   │
│  to authenticator    │
│  (Time-limited 30s)  │
└──────┬───────────────┘
       │
▼───────────────────────▼
User enters code from app
       │
       ▼
┌──────────────────────┐
│  Code valid & not    │
│  expired?            │
└──────┬───────────────┘
       │
       ▼ YES
┌──────────────────────┐
│  ✅ LOGIN SUCCESSFUL │
│  Session created     │
└──────────────────────┘
```

---

## Part 3: Role-Based Access Control (RBAC)

### 🔐 Lab 3: Implementing Least Privilege in an Application

**Objective:** Design and implement role-based permissions.

**Scenario:** A learning platform has three roles:

- `student` - Can view lessons they're enrolled in
- `instructor` - Can create and edit lessons
- `admin` - Can manage users and system settings

### 📋 Code Example (Express.js)

**Task 1: Define Roles and Permissions**

```javascript
const roles = {
  student: {
    permissions: ["view_course", "submit_assignment"],
  },
  instructor: {
    permissions: [
      "view_course",
      "create_lesson",
      "edit_lesson",
      "grade_assignment",
    ],
  },
  admin: {
    permissions: [
      "view_course",
      "create_lesson",
      "edit_lesson",
      "delete_lesson",
      "manage_users",
      "view_analytics",
      "system_settings",
    ],
  },
};
```

**Task 2: Create Authorization Middleware**

```javascript
// Middleware to check permissions
const authorize = (requiredPermission) => {
  return (req, res, next) => {
    const user = req.user; // From JWT token
    const userPermissions = roles[user.role].permissions;

    if (!userPermissions.includes(requiredPermission)) {
      return res.status(403).json({
        error: "Forbidden: insufficient permissions",
      });
    }

    next();
  };
};
```

**Task 3: Protect Routes with Authorization**

```javascript
// ❌ INSECURE - Anyone can delete lessons
app.delete("/api/lessons/:id", async (req, res) => {
  await Lesson.findByIdAndDelete(req.params.id);
  res.send("Lesson deleted");
});

// ✅ SECURE - Only instructors and admins can delete
app.delete(
  "/api/lessons/:id",
  authenticateToken,
  authorize("delete_lesson"),
  async (req, res) => {
    // Only users with 'delete_lesson' permission reach here
    await Lesson.findByIdAndDelete(req.params.id);
    res.send("Lesson deleted");
  },
);
```

**Task 4: Test the System**

```bash
# Login as student
curl -X POST http://localhost:3000/api/login \
  -d '{"email":"student@example.com","password":"pass"}'
# Response: { token: "eyJhbGc..." }

# Try to delete a lesson (student doesn't have permission)
curl -X DELETE http://localhost:3000/api/lessons/1 \
  -H "Authorization: Bearer eyJhbGc..."
# Response: 403 Forbidden - insufficient permissions

# Login as instructor
curl -X POST http://localhost:3000/api/login \
  -d '{"email":"instructor@example.com","password":"pass"}'

# Delete a lesson (instructor has permission)
curl -X DELETE http://localhost:3000/api/lessons/1 \
  -H "Authorization: Bearer eyJhbGc..."
# Response: 200 OK - Lesson deleted
```

---

## 🧠 Principle of Least Privilege (PoLP)

**Definition:** Users should have the minimum permissions needed to do their job.

**Example of Violation:**

```
❌ BAD: Give all employees admin access
  - Any compromised account = full system access
  - Accidental changes affect entire system

✅ GOOD: Give each role specific permissions
  - Student can only view enrolled courses
  - Instructor can only edit their own lessons
  - Admin has limited, audited access
```

---

## ✅ Completion Checklist

- [ ] Configured strong password policy on Linux system
- [ ] Tested weak password rejection
- [ ] Set up 2FA on GitHub
- [ ] Downloaded and tested authenticator app
- [ ] Saved recovery codes securely
- [ ] Understood how TOTP works
- [ ] Designed role-based access control for an application
- [ ] Implemented authorization middleware
- [ ] Tested RBAC enforcement

**Next Week:** Malware analysis and cyber hygiene - identifying and analyzing real malware.
