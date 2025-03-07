import { GluegunMenuToolbox } from '@lenne.tech/gluegun-menu'
import { Toolbox } from 'gluegun/build/types/domain/toolbox'
import * as path from 'path'
import { promises as rclone } from 'rclone.js'

import { InstallMegatools } from './install-megatools'
import { IConfig } from '../types'

export async function showMenu(
  toolbox: GluegunMenuToolbox | Toolbox,
  parentCommands = '',
  options: any = { byeMessage: 'Happy Hacking! 👋', showHelp: false }
): Promise<void> {
  await toolbox.menu.showMenu(parentCommands, options)
}

export async function inputStorageSize(toolbox: Toolbox): Promise<number> {
  const { print, filesystem, prompt } = toolbox

  let numAccounts = 0
  // Get number of accounts to create
  const sizes = await prompt.ask({
    name: 'size',
    type: 'select',
    message:
      'Select storage size (1 account = 20GB, more accounts = slower performance):',
    choices: ['264GB', '512GB', '1TB', '2TB', '4TB', 'custom', '[ back ]'],
  })

  switch (sizes.size) {
    case '264GB':
      numAccounts = Math.ceil(264 / 20)
      break
    case '512GB':
      numAccounts = Math.ceil(512 / 20)
      break
    case '1TB':
      numAccounts = Math.ceil(1024 / 20)
      break
    case '2TB':
      numAccounts = Math.ceil(2048 / 20)
      break
    case '4TB':
      numAccounts = Math.ceil(4096 / 20)
      break
    case 'custom':
      const customSize = await prompt.ask({
        name: 'customSize',
        type: 'input',
        message: 'Enter custom size in GB',
        format(value) {
          return `${value} GB`
        },
        validate(value) {
          const num = parseInt(value, 10)
          if (isNaN(num) || num <= 0) {
            return 'Please enter a valid number greater than 0'
          }
          return true
        },
      })
      const value = parseInt(customSize.customSize, 10)
      if (isNaN(value) || value <= 0) {
        print.error('Please enter a valid number greater than 0')
        return
      }
      numAccounts = Math.ceil(value / 20)
      break
    case '[ back ]':
      await showMenu(toolbox)
      break
  }
  return numAccounts
}

export async function createAccounts(
  toolbox: Toolbox,
  count: number,
  action: 'add' | 'replace' = 'replace'
): Promise<any[]> {
  const { print, system, prompt } = toolbox
  // Check requirements
  const requirementsLogger = print.spin('Checking requirements...')
  try {
    await system.exec('megatools reg --help')
    requirementsLogger.succeed('')
  } catch (error) {
    requirementsLogger.fail(
      'Megatools not installed. Please install it before running this command.'
    )
    await InstallMegatools(toolbox)
  }

  const numAccounts = count

  print.info(`Starting creation of ${numAccounts} MEGA accounts...`)
  let accounts: Array<{ email: string; password: string }> = []
  if (action === 'add') {
    const existingAccounts = await toolbox.mega.listAccounts()
    accounts = [...existingAccounts]
  }
  let startIndex = 0

  // Create accounts in batches
  while (startIndex < numAccounts) {
    const batchSize = Math.min(
      toolbox.config.CONCURRENT_LIMIT,
      numAccounts - startIndex
    )
    const batch = Array.from({ length: batchSize }, (_, i) => startIndex + i)

    const promises = batch.map(async () => {
      const accountLogger = print.spin().stop()
      try {
        // Step 1: Get email address
        const { email, token } = await toolbox.email.getEmailAddress()

        // Step 2: Create account
        const verifyCommand = await toolbox.account.createAccount(
          email,
          accountLogger
        )
        if (!verifyCommand) return null

        // Step 3: Get verification email
        const emailId = await toolbox.email.checkForMegaEmail(
          token,
          accountLogger
        )
        if (!emailId) {
          accountLogger.fail('No verification email received')
          return null
        }

        // Step 4: Get and process verification link
        const verificationLink = await toolbox.email.getVerificationLink(
          emailId,
          token,
          accountLogger
        )
        if (!verificationLink) {
          accountLogger.fail('Could not find verification link')
          return null
        }

        // Step 5: Complete verification
        accountLogger.text = 'Completing verification...'
        const verify_ref = verifyCommand.replace('@LINK@', verificationLink)
        const verificationResult = await system.exec(verify_ref)

        if (verificationResult.includes('registered successfully!')) {
          accountLogger.succeed(`Account created successfully: ${email}`)
          return {
            email,
            password: toolbox.config.PASSWORD,
            isVerified: true,
            verify_ref,
          }
        } else {
          accountLogger.fail('Verification failed')
          return null
        }
      } catch (error) {
        accountLogger.fail(`Account creation failed: ${error.message}`)
        return null
      }
    })

    const results = await Promise.all(promises)
    accounts.push(...results.filter((result): any => result !== null))
    startIndex += batchSize
  }

  // Save accounts
  await toolbox.account.saveAccounts(accounts)

  // Final summary
  print.success(
    `\nSuccessfully created: ${accounts.length}/${numAccounts} accounts`
  )
  print.info(`Failed: ${numAccounts - accounts.length} accounts`)
  return accounts
}

export async function getRcloneConfig() {
  const configDir = path.join(process.cwd(), 'generated')
  const configPath = path.join(configDir, 'rclone.conf')
  let rcloneConfig = {}
  try {
    const result = await rclone.config('dump', {
      'max-depth': 1,
      // Spawn options:
      env: {
        RCLONE_CONFIG: configPath,
      },
      shell: '/bin/sh',
    })
    rcloneConfig = JSON.parse(result.toString('utf-8'))
  } catch (e) {}

  return rcloneConfig
}

export async function inputUserPass(
  toolbox: Toolbox
): Promise<{ user: string; pass: string }> {
  const { user } = await toolbox.prompt.ask([
    { type: 'input', name: 'user', message: 'Enter username (optional):' },
  ])

  const { pass } = await toolbox.prompt.ask([
    {
      type: 'input',
      name: 'pass',
      message: 'Enter password (optional):',
      skip: !user,
    },
  ])

  return { user, pass }
}

export async function updateConfig(
  toolbox: Toolbox,
  newConfig: Partial<IConfig>
): Promise<void> {
  const { config } = toolbox
  const updatedConfig = { ...config, ...newConfig }
  delete updateConfig['free-drive']
  await toolbox.template.generate({
    template: 'config.ts.ejs',
    target: `generated/custom.config.js`,
    props: {
      config: updatedConfig,
    },
  })
}
