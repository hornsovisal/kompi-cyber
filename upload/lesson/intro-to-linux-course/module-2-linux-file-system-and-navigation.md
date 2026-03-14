# Linux File System and Navigation

The Linux file system is organized as a tree that starts from the root directory: `/`.

## Common Directories

- `/home` user home folders.
- `/etc` system configuration files.
- `/var` variable data such as logs.
- `/tmp` temporary files.
- `/usr` user applications and shared resources.

## Navigation Commands

- `pwd` print current location.
- `ls -la` list all files with details.
- `cd /path` move to a specific path.
- `cd ~` move to your home directory.

## Working with Files and Folders

- `mkdir notes` create a folder.
- `touch notes.txt` create an empty file.
- `cp source.txt backup.txt` copy a file.
- `mv old.txt new.txt` move/rename a file.
- `rm file.txt` delete a file.

## Safety Tip

Use `rm` carefully. Deleting files from the terminal may be permanent.

## Practice

1. Create a folder named `linux-lab`.
2. Enter the folder.
3. Create two files: `a.txt` and `b.txt`.
4. Rename `b.txt` to `notes.txt`.
5. List files using `ls -la`.
