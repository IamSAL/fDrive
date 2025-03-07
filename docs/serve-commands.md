# Serve Commands

This document provides detailed information about fDrive's serve commands, which allow you to expose MEGA storage through various protocols.

## Prerequisites

- At least one MEGA account must be configured
- Appropriate network permissions
- Required protocol-specific dependencies

## Available Commands

### `fdrive serve`
**Description:** Access the interactive menu for all serving protocols.

**Usage:**
```bash
fdrive serve
```

**Features:**
- Interactive protocol selection
- Easy configuration options
- Real-time status monitoring

### `fdrive serve http`
**Description:** Serve MEGA storage via HTTP protocol.

**Parameters:**
- `port`: Port number for the HTTP server (default: 8080)
- `user`: Username for authentication
- `pass`: Password for authentication

**Usage:**
```bash
fdrive serve http
```

**Features:**
- Basic authentication support
- Custom port configuration
- Web-based file browsing
- Direct file download/upload

### `fdrive serve dlna`
**Description:** Stream media content over DLNA protocol.

**Usage:**
```bash
fdrive serve dlna
```

**Features:**
- Media streaming support
- Auto-discovery on local network
- Compatible with DLNA/UPnP devices

### `fdrive serve ftp`
**Description:** Provide FTP access to MEGA storage.

**Usage:**
```bash
fdrive serve ftp
```

**Features:**
- Standard FTP protocol support
- User authentication
- Active/passive mode support

### `fdrive serve nfs`
**Description:** Export MEGA storage as NFS share.

**Usage:**
```bash
fdrive serve nfs
```

**Features:**
- NFS v3/v4 support
- Export configuration
- Access control lists

### `fdrive serve s3`
**Description:** Provide S3-compatible API access.

**Usage:**
```bash
fdrive serve s3
```

**Features:**
- S3 API compatibility
- Access/Secret key management
- Bucket emulation

### `fdrive serve sftp`
**Description:** Secure FTP access to MEGA storage.

**Usage:**
```bash
fdrive serve sftp
```

**Features:**
- Encrypted file transfers
- SSH key authentication
- SFTP protocol compliance

### `fdrive serve docker`
**Description:** Docker volume integration.

**Usage:**
```bash
fdrive serve docker
```

**Features:**
- Docker volume plugin
- Container storage support
- Persistent volume data

### `fdrive serve ui`
**Description:** Web-based management interface.

**Usage:**
```bash
fdrive serve ui
```

**Features:**
- Modern web interface
- File management
- Account monitoring

### `fdrive serve restic`
**Description:** Restic backup repository support.

**Usage:**
```bash
fdrive serve restic
```

**Features:**
- Restic backup compatibility
- Encryption support
- Deduplication

## Best Practices

1. **Security:**
   - Always use strong authentication
   - Enable encryption when available
   - Regularly rotate credentials
   - Monitor access logs

2. **Performance:**
   - Choose appropriate protocols
   - Monitor bandwidth usage
   - Configure caching properly
   - Optimize for use case

3. **Reliability:**
   - Regular health checks
   - Implement auto-recovery
   - Monitor system resources
   - Backup configurations

## Troubleshooting

### Common Issues

1. **Connection Problems:**
   - Verify network connectivity
   - Check firewall settings
   - Confirm port availability
   - Validate credentials

2. **Performance Issues:**
   - Monitor system resources
   - Check network bandwidth
   - Verify client compatibility
   - Optimize configurations

3. **Authentication Failures:**
   - Verify credentials
   - Check permission settings
   - Validate protocol settings
   - Review access logs

## Additional Information

- All protocols support `--help` flag
- Configuration files are managed automatically
- Multiple protocols can run simultaneously
- Logging is available for all services

## See Also

- [Account Management Commands](account-management.md)
- [Disk Management Commands](disk-management.md)
- [Main Command Reference](commands.md)