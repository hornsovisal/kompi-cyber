# Understanding Web Architecture

Web applications are built from multiple connected components.

## Core Components

- Client (browser or mobile app).
- Web server and application logic.
- Database and storage.
- APIs and third-party integrations.

## Trust Boundaries

Security decisions must be enforced at trust boundaries:

- Browser to server.
- Server to database.
- Internal services to external providers.

## Common Risk Areas

- Weak session management.
- Insecure API endpoints.
- Excessive privileges in backend services.
