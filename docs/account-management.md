# Account Management Commands

This document provides detailed information about fDrive's account management commands, which allow you to create, verify, and manage MEGA accounts.

## Available Commands

### `fdrive accounts`
**Description:** Manage MEGA accounts through an interactive menu interface.

**Usage:**
```bash
fdrive accounts
```

**Features:**
- Interactive menu-based interface
- Access to all account management functions
- Easy-to-use command structure

### `fdrive accounts create`
**Description:** Create new MEGA accounts with specified storage size.

**Parameters:**
- `count`: Number of accounts to create
- `storage`: Storage size in GB (will be prompted)

**Usage:**
```bash
fdrive accounts create
```

**Process:**
1. Run the command
2. Enter the desired storage size when prompted
3. Wait for account creation to complete
4. Receive confirmation and account details

**Notes:**
- Accounts are automatically added to your configuration
- Storage size must be a valid number in GB
- Account credentials are securely stored

### `fdrive accounts verify`
**Description:** Verify the status of specific MEGA accounts.

**Usage:**
```bash
fdrive accounts verify
```

**Features:**
- Lists unverified accounts for selection
- Performs comprehensive account verification
- Updates account status in configuration

### `fdrive accounts list`
**Description:** Display a list of all configured MEGA accounts.

**Usage:**
```bash
fdrive accounts list
```

**Output Information:**
- Account email addresses
- Storage capacity and usage
- Verification status
- Last activity timestamp

### `fdrive accounts keep-active`
**Description:** Keep accounts active by performing periodic operations.

**Usage:**
```bash
fdrive accounts keep-active
```

**Features:**
- Automated activity simulation
- Prevents account inactivity timeouts
- Configurable operation intervals

## Best Practices

1. **Account Creation:**
   - Create accounts with reasonable storage sizes
   - Verify accounts immediately after creation
   - Store backup of account credentials

2. **Account Management:**
   - Regularly check account status
   - Keep accounts active to prevent timeout
   - Monitor storage usage

3. **Security:**
   - Use strong passwords
   - Enable two-factor authentication when available
   - Regularly update account credentials

## Troubleshooting

### Common Issues

1. **Account Creation Fails:**
   - Check internet connection
   - Verify email format
   - Ensure storage size is valid

2. **Verification Issues:**
   - Confirm account credentials
   - Check account status on MEGA
   - Retry verification process

3. **Activity Maintenance:**
   - Verify scheduled tasks
   - Check system resources
   - Monitor activity logs

## Additional Information

- All commands support `--help` flag for detailed usage information
- Configuration files are automatically managed
- Account credentials are stored securely
- Multiple accounts can be managed simultaneously

## See Also

- [Disk Management Commands](disk-management.md)
- [Serve Commands](serve-commands.md)
- [Main Command Reference](commands.md)