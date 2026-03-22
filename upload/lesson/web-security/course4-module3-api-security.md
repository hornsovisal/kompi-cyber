# Module 3: API Security

## Learning Objectives

- Secure APIs against common attacks
- Implement authentication and authorization
- Validate and sanitize API inputs
- Handle sensitive data in APIs
- Monitor and log API access

## API Security Fundamentals

### Authentication vs Authorization

**Authentication**: Verifying identity (who are you?)

- API keys
- OAuth 2.0
- JWT tokens
- Mutual TLS

**Authorization**: Granting permissions (what can you do?)

- Role-based access control (RBAC)
- Attribute-based access control (ABAC)
- Scope limitations
- Rate limiting

## API Authentication Methods

### API Key Authentication

```javascript
// Node.js Express middleware
const apiKeyAuth = (req, res, next) => {
  const apiKey = req.headers["x-api-key"];

  if (!apiKey || !isValidApiKey(apiKey)) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
};

// Usage
app.use("/api/", apiKeyAuth);
```

### JWT Token Authentication

```javascript
// Generate token
const token = jwt.sign(
  { userId: user.id, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: "1h" },
);

// Verify token middleware
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.user = decoded;
    next();
  });
};
```

## Input Validation and Sanitization

### Validate All Inputs

```javascript
// Using express-validator
const { body, validationResult } = require("express-validator");

app.post(
  "/api/users",
  [
    body("email").isEmail().normalizeEmail(),
    body("password").isLength({ min: 8 }),
    body("name").trim().notEmpty(),
    body("age").isInt({ min: 0, max: 150 }),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // Process valid request
  },
);
```

### Prevent Injection Attacks

```javascript
// BAD - SQL Injection vulnerable
const query = `SELECT * FROM users WHERE email = '${req.body.email}'`;

// GOOD - Parameterized query
const query = "SELECT * FROM users WHERE email = ?";
db.query(query, [req.body.email]);

// Prevent XSS
const sanitizeHtml = require("sanitize-html");
const cleanInput = sanitizeHtml(userInput, { allowedTags: [] });
```

## Rate Limiting and Throttling

```javascript
// Express rate limiter
const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests, please try again later",
});

app.use("/api/", limiter);

// Different limits for different endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 login attempts per 15 min
  skipSuccessfulRequests: true,
});

app.post("/api/login", authLimiter, loginHandler);
```

## Secure API Response Handling

### Minimize Information Disclosure

```javascript
// BAD - Reveals database structure
{
    id: 1,
    email: 'user@example.com',
    password_hash: 'bcrypt_hash_here',
    internal_id: 'DB_12345',
    created_timestamp: 1234567890
}

// GOOD - Only necessary fields
{
    id: 1,
    email: 'user@example.com',
    username: 'john_doe'
}
```

### Use HTTPS Only

```javascript
// Redirect HTTP to HTTPS
app.use((req, res, next) => {
  if (req.header("x-forwarded-proto") !== "https") {
    res.redirect(`https://${req.header("host")}${req.url}`);
  } else {
    next();
  }
});

// Set security headers
app.use((req, res, next) => {
  res.setHeader("Strict-Transport-Security", "max-age=31536000");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  next();
});
```

## API Logging and Monitoring

```javascript
// Log API access
const apiLogger = (req, res, next) => {
  const startTime = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - startTime;
    console.log({
      timestamp: new Date().toISOString(),
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: duration + "ms",
      ip: req.ip,
      user: req.user?.id || "anonymous",
    });
  });

  next();
};

app.use(apiLogger);
```

## Real-World Scenario: Securing a Public API

**Requirements**:

- Protect user data
- Prevent abuse and DDoS
- Monitor for suspicious activity
- Maintain audit trail

**Implementation**:

1. Require authentication (API key or OAuth)
2. Implement rate limiting per user/IP
3. Validate all inputs strictly
4. Use HTTPS exclusively
5. Return minimal information in responses
6. Log all access with user ID
7. Monitor for unusual patterns
8. Implement CORS properly

## CORS (Cross-Origin Resource Sharing)

```javascript
// Allow requests from specific origins
const cors = require("cors");

const corsOptions = {
  origin: ["https://example.com", "https://app.example.com"],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ["GET", "POST", "PUT", "DELETE"],
};

app.use(cors(corsOptions));
```

## Quick Check

1. API keys should never be stored in client-side code. **(True - use secure storage)**
2. Publishing internal object structures in API responses is acceptable. **(False - information disclosure)**
3. HTTPS is optional for APIs. **(False - always use HTTPS)**

## Summary

Securing APIs requires multi-layered protection: strong authentication, strict input validation, rate limiting, secure response handling, and comprehensive logging. Regular security audits and monitoring help identify and address vulnerabilities before they're exploited.
