import { GluegunCommand } from 'gluegun'
import { InstallMegatools } from '../../helpers/install-megatools'
import { CONFIG } from '../../config/account-config'

const command: GluegunCommand = {
  name: 'create',
  description: 'Create new MEGA accounts',
  run: async (toolbox) => {
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

    let numAccounts = 1
    // Get number of accounts to create
    const sizes = await prompt.ask({
      name: 'size',
      type: 'select',
      message:
        'Select total storage size (1 MEGA account === 20GB, smaller size === faster performance)',
      choices: ['264GB', '512GB', '1TB', '2TB', '4TB', 'custom'],
    })
    console.log(sizes.size)
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
        })
        const value = parseInt(customSize.customSize, 10)
        if (isNaN(value) || value <= 0) {
          print.error('Please enter a valid number greater than 0')
          return
        }
        numAccounts = Math.ceil(value / 20)
        break
    }

    print.info(`Starting creation of ${numAccounts} MEGA accounts...`)
    const accounts: Array<{ email: string; password: string }> = []
    let startIndex = 0

    // Create accounts in batches
    while (startIndex < numAccounts) {
      const batchSize = Math.min(
        CONFIG.CONCURRENT_LIMIT,
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
          const verificationResult = await system.exec(verifyCommand)

          if (verificationResult.includes('registered successfully!')) {
            accountLogger.succeed(`Account created successfully: ${email}`)
            return {
              email,
              password: CONFIG.PASSWORD,
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
    process.exit(0)
  },
}

module.exports = command
