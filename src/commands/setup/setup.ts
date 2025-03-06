import { GluegunCommand } from 'gluegun'
import * as path from 'path'
import { createAccounts, inputStorageSize } from '../../helpers/misc'
import { runRcloneCommand } from '../../helpers/rclone-runner'

interface AccountData {
  email: string
  password: string
}

const command: GluegunCommand = {
  name: 'setup',
  description: 'Generate rclone configuration from account data',
  run: async (toolbox) => {
    const { print, filesystem, prompt, parameters, config } = toolbox
    const accountsPath = path.join(process.cwd(), 'generated', 'accounts.json')
    const configDir = path.join(process.cwd(), 'generated')
    const configPath = path.join(configDir, 'rclone.conf')

    // Ensure generated directory exists
    if (!filesystem.exists(configDir)) {
      filesystem.dir(configDir)
    }

    const IsAlreadySetup = config.isSetup
    const accountsData = await loadAccountsData(filesystem, accountsPath)

    if (IsAlreadySetup) {
      await handleExistingSetup(toolbox, accountsPath, configPath, accountsData)
    } else {
      await handleNewSetup(toolbox, parameters)
    }

    // Only regenerate rclone config if accounts have changed
    const updatedAccountsData = await loadAccountsData(filesystem, accountsPath)
    if (updatedAccountsData && updatedAccountsData.length > 0) {
      // Compare with original accounts data to check for changes
      const accountsChanged =
        JSON.stringify(updatedAccountsData) !== JSON.stringify(accountsData)

      if (accountsChanged) {
        await generateRcloneConfig(print, updatedAccountsData, configPath)
      }
    } else {
      print.error('No account data available. Please create accounts first.')
      return
    }
  },
}

async function loadAccountsData(
  filesystem: any,
  accountsPath: string
): Promise<AccountData[]> {
  if (!filesystem.exists(accountsPath)) {
    return []
  }
  try {
    return JSON.parse(filesystem.read(accountsPath) || '[]') || []
  } catch (error) {
    return []
  }
}

async function handleExistingSetup(
  toolbox: any,
  accountsPath: string,
  configPath: string,
  currentAccounts: AccountData[]
) {
  const { print, prompt } = toolbox
  const currentStorageGB = currentAccounts.length * 20

  print.muted(
    `Current storage capacity: ${currentStorageGB}GB (${currentAccounts.length} accounts)`
  )

  const storageAction = await prompt.ask({
    type: 'select',
    name: 'action',
    message: 'Your fDrive storage is already configured. Would you like to:',
    choices: ['Keep Current', 'Modify Storage', 'Start Fresh'],
  })

  switch (storageAction.action) {
    case 'Keep Current':
      return
    case 'Start Fresh':
      await handleStartFresh(toolbox, accountsPath, configPath)
      break
    case 'Modify Storage':
      await handleModifyStorage(toolbox, currentAccounts)
      break
  }
}

async function handleStartFresh(
  toolbox: any,
  accountsPath: string,
  configPath: string
) {
  const { prompt, print, filesystem } = toolbox

  const confirmation = await prompt.ask({
    type: 'confirm',
    name: 'confirm',
    message:
      '⚠️ This will remove all existing accounts and data. Are you sure?',
  })
  if (!confirmation.confirm) return

  if (await shouldBackupConfig(prompt)) {
    await backupConfiguration(filesystem, accountsPath, configPath, print)
  }

  const numAccounts = await inputStorageSize(toolbox)
  if (numAccounts > 0) {
    await toolbox.account.saveAccounts([])
    await createAccounts(toolbox, numAccounts)
  }
}

async function shouldBackupConfig(prompt: any): Promise<boolean> {
  const backupConfirm = await prompt.ask({
    type: 'confirm',
    name: 'confirm',
    message: 'Would you like to backup your current configuration?',
  })
  return backupConfirm.confirm
}

async function backupConfiguration(
  filesystem: any,
  accountsPath: string,
  configPath: string,
  print: any
) {
  const timestamp = new Date().toISOString().replace(/:/g, '-')
  const backupDir = path.join(process.cwd(), 'fdrive', timestamp)
  filesystem.dir(backupDir)

  if (filesystem.exists(configPath)) {
    filesystem.copy(
      configPath,
      path.join(backupDir, `rclone.conf.${timestamp}.bak`)
    )
  }

  if (filesystem.exists(accountsPath)) {
    filesystem.copy(
      accountsPath,
      path.join(backupDir, `accounts.json.${timestamp}.bak`)
    )
  }

  print.success('Backup created successfully: ' + backupDir)
}

async function handleModifyStorage(
  toolbox: any,
  currentAccounts: AccountData[]
) {
  const { print, prompt } = toolbox
  const newSize = await inputStorageSize(toolbox)
  if (!newSize) return

  const newAccounts = Math.ceil(newSize / 20)
  const accountDiff = newAccounts - currentAccounts.length

  if (accountDiff === 0) {
    print.info('No storage change needed - keeping current configuration')
    return
  }

  const action = accountDiff > 0 ? 'add' : 'remove'
  const diffCount = Math.abs(accountDiff)

  const confirmation = await prompt.ask({
    type: 'confirm',
    name: 'confirm',
    message: `This will ${action} ${diffCount} account(s) (${Math.abs(
      accountDiff * 20
    )}GB). Continue?`,
  })

  if (!confirmation.confirm) return

  if (action === 'remove') {
    await handleRemoveAccounts(
      toolbox,
      currentAccounts,
      newAccounts,
      newSize,
      diffCount
    )
  } else {
    await handleAddAccounts(toolbox, diffCount, newSize)
  }
}

async function handleRemoveAccounts(
  toolbox: any,
  currentAccounts: AccountData[],
  newAccounts: number,
  newSize: number,
  diffCount: number
) {
  const { print } = toolbox
  currentAccounts.splice(newAccounts)
  await toolbox.account.saveAccounts(currentAccounts)
  print.success(`Removed ${diffCount} accounts. New storage: ${newSize}GB`)
}

async function handleAddAccounts(
  toolbox: any,
  diffCount: number,
  newSize: number
) {
  const { print } = toolbox
  const newlyCreated = await createAccounts(toolbox, diffCount, 'add')
  if (newlyCreated && newlyCreated.length > 0) {
    print.success(
      `Added ${newlyCreated.length} new accounts. New storage: ${newSize}GB`
    )
  }
}

async function handleNewSetup(toolbox: any, parameters: any) {
  if (parameters.first === 'skip-register') {
    toolbox.print.info('Skipping account creation')
    return
  }

  const numAccounts = await inputStorageSize(toolbox)
  if (numAccounts > 0) {
    await createAccounts(toolbox, numAccounts)
  }
}

async function generateRcloneConfig(
  print: any,
  accountsData: AccountData[],
  configPath: string
) {
  try {
    // Generate rclone config using CLI commands
    for (const account of accountsData) {
      const username = account.email.split('@')[0]
      try {
        await runRcloneCommand(
          `config create mega_${username} mega user ${account.email} pass ${account.password}`
        )
        print.success(`Added remote: mega_${username}`)
      } catch (error) {
        print.error(`Failed to add remote mega_${username}: ${error.message}`)
      }
    }

    // Create union remote configuration
    const unionRemotes = accountsData
      .map((account) => `mega_${account.email.split('@')[0]}:`)
      .join(' ')

    try {
      await runRcloneCommand(
        `config create fdrive union upstreams "${unionRemotes}"`
      )
      print.success('Created union remote: fdrive')
    } catch (error) {
      print.error(`Failed to create union remote: ${error.message}`)
      return
    }

    print.success(`Rclone configuration generated at ${configPath}`)
    process.exit(0)
  } catch (error) {
    print.error(`Failed to generate rclone configuration: ${error.message}`)
    process.exit(1)
  }
}

module.exports = command
