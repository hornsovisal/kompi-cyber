# SQL Injection and XSS

SQL Injection and Cross-Site Scripting are two high-impact vulnerabilities.

## SQL Injection

Occurs when user input is concatenated directly into SQL queries.

### Prevention

- Use parameterized queries.
- Validate and constrain input.
- Apply least privilege to DB users.

## Cross-Site Scripting (XSS)

Occurs when untrusted input is rendered as executable script in the browser.

### Prevention

- Output encoding.
- Content Security Policy (CSP).
- Input sanitization where appropriate.
