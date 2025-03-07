# fDrive CLI

A command-line interface for managing MEGA storage accounts with various protocols and features.

## Quick Command Reference

### Account Management
- `fdrive accounts` - Manage MEGA accounts
- `fdrive accounts create` - Create new accounts
- `fdrive accounts verify` - Verify account status
- `fdrive accounts list` - List all accounts
- `fdrive accounts keep-active` - Keep accounts active

### Disk Operations
- `fdrive disk` - Manage disk operations
- `fdrive disk mount` - Mount MEGA storage
- `fdrive disk umount` - Unmount storage

### Storage Serving
- `fdrive serve` - Access storage via various protocols
  - HTTP, DLNA, FTP, NFS, S3, SFTP
  - Docker integration
  - Web UI
  - Restic backup

For detailed command documentation and examples, see [Command Reference](docs/commands.md).

## Installation

```shell
$ npm install -g fdrive
```

## Features
- Interactive command interface
- Multiple account management
- Various storage access protocols
- Secure authentication
- Automatic configuration management

## License

MIT - see LICENSE

