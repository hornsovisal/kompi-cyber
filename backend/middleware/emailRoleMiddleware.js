/**
 * Email-Based Role Detection Middleware
 * 
 * This demonstrates how to identify if an email belongs to
 * a teacher, coordinator, or student account.
 * 
 * Usage: See examples at bottom of file
 */

// Option 1: Check after login (from JWT token)
// This is the RECOMMENDED approach
const getUserRoleFromEmail = async (email) => {
  try {
    const users = await db.execute(
      `SELECT role_id, full_name, email FROM users WHERE email = ? LIMIT 1`,
      [email]
    );

    if (!users[0]) {
      return {
        found: false,
        role: null,
        roleId: null,
        name: "Unknown"
      };
    }

    const user = users[0];
    const roleNames = {
      1: "STUDENT",
      2: "TEACHER",
      3: "ADMIN",
      4: "COORDINATOR"
    };

    return {
      found: true,
      role: roleNames[user.role_id] || "UNKNOWN",
      roleId: user.role_id,
      name: user.full_name,
      email: user.email,
      isTeacher: user.role_id === 2,
      isCoordinator: user.role_id === 4,
      isStudent: user.role_id === 1,
      isAdmin: user.role_id === 3
    };
  } catch (error) {
    console.error("Error getting user role:", error);
    return { found: false, error: error.message };
  }
};

// Option 2: Middleware to inject role info into request
const injectUserRole = async (req, res, next) => {
  const email = req.user?.email;

  if (!email) {
    return res.status(400).json({
      message: "Email not found in token"
    });
  }

  try {
    const roleInfo = await getUserRoleFromEmail(email);

    if (!roleInfo.found) {
      return res.status(404).json({
        message: "User not found",
        email
      });
    }

    // Attach to request for use in controller
    req.userRole = roleInfo;
    req.isTeacher = roleInfo.isTeacher;
    req.isCoordinator = roleInfo.isCoordinator;

    next();
  } catch (error) {
    res.status(500).json({
      message: "Error checking user role",
      error: error.message
    });
  }
};

// Option 3: Use in controller to differentiate behavior
const actionBasedOnRole = async (req, res) => {
  const email = req.user?.email;
  const roleInfo = await getUserRoleFromEmail(email);

  console.log(`${roleInfo.name} (${roleInfo.role}) is attempting action...`);

  if (roleInfo.isTeacher) {
    // Teacher-specific logic
    console.log("✅ Teacher detected - allowing course cloning");
    return res.json({ message: "Teacher can clone courses" });
  }

  if (roleInfo.isCoordinator) {
    // Coordinator-specific logic
    console.log("✅ Coordinator detected - allowing curriculum design");
    return res.json({ message: "Coordinator can design curriculum" });
  }

  if (roleInfo.isStudent) {
    // Student-specific logic
    console.log("✅ Student detected - allowing enrollment");
    return res.json({ message: "Student can enroll in courses" });
  }

  res.status(403).json({
    message: "User role not recognized",
    role: roleInfo.role
  });
};

// =============================================================
// PRACTICAL EXAMPLES
// =============================================================

/*
EXAMPLE 1: Check email after login
──────────────────────────────────

POST /api/auth/login
{
  "email": "teacher@kompi-cyber.local",
  "password": "TeacherPass123!"
}

Controller:
const loginUser = async (req, res) => {
  // ... existing login logic ...
  
  // NEW: Check what role this email is
  const roleInfo = await getUserRoleFromEmail(user.email);
  
  console.log(`${roleInfo.name} logged in as ${roleInfo.role}`);
  
  // You can send extra info to client
  return res.json({
    message: "Login successful",
    token,
    user: {
      ...user,
      roleInfo // Include role details
    }
  });
};


EXAMPLE 2: Middleware to check email type
──────────────────────────────────────────

router.post(
  "/action",
  authMiddleware.authenticateToken,    // Verify JWT
  injectUserRole,                       // Check email & role
  authMiddleware.requireTeacherOnly,    // Only allow role 2
  controller.action
);

When teacher@kompi-cyber.local accesses:
✅ ALLOWED - roleId=2, email found, teacher role confirmed

When coordinator@kompi-cyber.local accesses:
❌ BLOCKED - roleId=4, middleware says "Teacher access required"

When student@kompi-cyber.local accesses:
❌ BLOCKED - roleId=1, middleware says "Teacher access required"


EXAMPLE 3: Different behavior based on email
─────────────────────────────────────────────

router.post(
  "/course-action",
  authMiddleware.authenticateToken,
  actionBasedOnRole  // This checks email and runs conditional logic
);

When teacher@kompi-cyber.local:
Response: "Teacher can clone courses" ✅

When coordinator@kompi-cyber.local:
Response: "Coordinator can design curriculum" ✅

When student@kompi-cyber.local:
Response: "Student can enroll in courses" ✅
*/

module.exports = {
  getUserRoleFromEmail,
  injectUserRole,
  actionBasedOnRole
};
