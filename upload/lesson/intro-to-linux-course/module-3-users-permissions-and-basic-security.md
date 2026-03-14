# Users, Permissions, and Basic Security

Linux controls access using users, groups, and file permissions.

## Permission Model

Each file has permissions for:

- **Owner**
- **Group**
- **Others**

Permission types:

- `r` read
- `w` write
- `x` execute

Example: `-rwxr-xr--`

## Useful Commands

- `id` show user and group IDs.
- `ls -l` view file permissions.
- `chmod` change permissions.
- `chown` change file owner.
- `sudo` run command with elevated privileges.

## Common Permission Changes

- `chmod 644 file.txt` owner read/write, others read.
- `chmod 755 script.sh` owner full, others read/execute.

## Basic Security Habits

- Use strong passwords.
- Avoid running as root unless needed.
- Keep software updated.
- Review logs in `/var/log`.

## Practice

1. Create a script file `hello.sh`.
2. Add a simple echo line in the file.
3. Make it executable with `chmod 755 hello.sh`.
4. Run it with `./hello.sh`.

This module completes your Linux beginner foundation.
