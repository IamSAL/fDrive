# Disk Management Commands

This document provides detailed information about fDrive's disk management commands, which allow you to mount and manage MEGA storage as local disks.

## Available Commands

### `fdrive disk`
**Description:** Manage local and remote disk operations through an interactive menu.

**Usage:**
```bash
fdrive disk
```

**Features:**
- Interactive menu interface
- Easy access to all disk operations
- Real-time status monitoring

### `fdrive disk mount`
**Description:** Mount MEGA storage as a local disk.

**Usage:**
```bash
fdrive disk mount
```

**Process:**
1. Select MEGA account(s) to mount
2. Choose mount point location
3. Configure mount options
4. Wait for mounting process to complete

**Features:**
- Automatic mount point creation
- Multiple account mounting support
- Persistent mount configuration
- Real-time status monitoring

### `fdrive disk umount`
**Description:** Unmount previously mounted MEGA storage.

**Usage:**
```bash
fdrive disk umount
```

**Process:**
1. Select mounted storage to unmount
2. Confirm unmount operation
3. Wait for unmounting process to complete

**Features:**
- Safe unmounting procedure
- Multiple storage unmount support
- Automatic cleanup of mount points

## Best Practices

1. **Mounting Storage:**
   - Choose appropriate mount points
   - Verify sufficient system permissions
   - Monitor available system resources

2. **Usage:**
   - Regularly check mounted storage status
   - Monitor disk space usage
   - Implement proper error handling

3. **Security:**
   - Set appropriate permissions for mount points
   - Use secure mount options
   - Regularly verify mount integrity

## Troubleshooting

### Common Issues

1. **Mount Failures:**
   - Check internet connection
   - Verify account credentials
   - Ensure mount point is available
   - Check system permissions

2. **Performance Issues:**
   - Monitor network bandwidth
   - Check system resources
   - Verify mount options

3. **Unmount Problems:**
   - Ensure no active file operations
   - Close all open files
   - Check for busy processes

## Additional Information

- All commands support `--help` flag for detailed usage
- Mount configurations are stored securely
- Multiple accounts can be mounted simultaneously
- Automatic recovery from network issues

## See Also

- [Account Management Commands](account-management.md)
- [Serve Commands](serve-commands.md)
- [Main Command Reference](commands.md)