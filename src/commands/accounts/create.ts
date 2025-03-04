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

    // Get number of accounts to create
    const answer = await prompt.ask({
      name: 'numAcc',
      type: 'input',
      message: 'How many accounts do you want to create?',
    })

    const numAccounts = parseInt(answer.numAcc, 10)
    if (isNaN(numAccounts) || numAccounts <= 0) {
      print.error('Please enter a valid number greater than 0')
      return
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
          const success = await toolbox.account.createAccount(
            email,
            accountLogger
          )
          if (!success) return null

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
          const verificationResult = await system.exec(
            `megatools reg --scripted --verify --link ${verificationLink}`
          )

          if (verificationResult.includes('registered successfully!')) {
            accountLogger.succeed(`Account created successfully: ${email}`)
            return { email, password: CONFIG.PASSWORD }
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
      accounts.push(
        ...results.filter(
          (result): result is { email: string; password: string } =>
            result !== null
        )
      )
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
