import { GluegunCommand } from 'gluegun'
import axios from 'axios'
import { Toolbox } from 'gluegun/build/types/domain/toolbox'

// Configuration
const CONFIG = {
  PASSWORD: 'iamsal275', // at least 8 chars
  MAX_EMAIL_CHECK_ATTEMPTS: 10,
  EMAIL_CHECK_INTERVAL_MS: 3000,
  OUTPUT_FILE_PATH: 'generated/accounts.csv',
}

// Utility functions
const urlRegex =
  /\b((?:https?:\/\/|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}\/)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()\[\]{};:'\".,<>?«»""'']))/g

const findUrls = (text: string): string[] => {
  const matches = text.match(urlRegex)
  return matches || []
}

const generateRandomUsername = (): string => {
  return `user_${Math.random().toString(36).substring(2, 10)}`
}

// Service classes
class GuerrillaMailService {
  // Stateless service methods that take required parameters

  async getEmailAddress(): Promise<{ email: string; token: string }> {
    const response = await axios.get(
      'https://api.guerrillamail.com/ajax.php?f=get_email_address&lang=en'
    )

    return {
      email: response.data.email_addr,
      token: response.data.sid_token,
    }
  }

  async checkForMegaEmail(
    emailToken: string,
    logger: any
  ): Promise<string | null> {
    for (
      let attempt = 1;
      attempt <= CONFIG.MAX_EMAIL_CHECK_ATTEMPTS;
      attempt++
    ) {
      logger.text = `Checking for verification email (attempt ${attempt}/${CONFIG.MAX_EMAIL_CHECK_ATTEMPTS})...`

      await new Promise((resolve) =>
        setTimeout(resolve, CONFIG.EMAIL_CHECK_INTERVAL_MS)
      )

      const response = await axios.get(
        `https://api.guerrillamail.com/ajax.php?f=get_email_list&offset=0&sid_token=${emailToken}`
      )

      for (const email of response.data.list) {
        if (email.mail_subject.includes('MEGA')) {
          logger.text = `Found MEGA verification email!`
          return email.mail_id
        }
      }
    }

    return null
  }

  async getVerificationLink(
    emailId: string,
    emailToken: string
  ): Promise<string | null> {
    const response = await axios.get(
      `https://api.guerrillamail.com/ajax.php?f=fetch_email&email_id=${emailId}&sid_token=${emailToken}`
    )

    const mailBody = response.data.mail_body
    const links = findUrls(mailBody)

    // The verification link is typically the third link in the email
    return links.length >= 3 ? links[2] : null
  }
}

class MegaAccountManager {
  private tools: Toolbox
  private mailService: GuerrillaMailService
  private accounts: string[] = []

  constructor(toolbox: Toolbox) {
    this.tools = toolbox
    this.mailService = new GuerrillaMailService()
  }

  async createAccount(logger: any): Promise<boolean> {
    try {
      const username = generateRandomUsername()
      logger.text = `Creating new account: ${username}...`

      // Step 1: Get email address with unique token for this account
      logger.text = 'Getting temporary email address...'
      const { email, token } = await this.mailService.getEmailAddress()

      // Step 2: Register with MEGA
      logger.text = `Registering with MEGA using email: ${email}...`
      const registerCommand = await this.tools.system.run(
        `megatools reg --scripted --register --email ${email} --name ${username} --password ${CONFIG.PASSWORD}`
      )

      // Step 3: Wait for and process verification email using the account-specific token
      const emailId = await this.mailService.checkForMegaEmail(token, logger)
      if (!emailId) {
        throw new Error('No verification email received')
      }

      // Step 4: Get verification link using the account-specific token
      logger.text = 'Extracting verification link...'
      const verificationLink = await this.mailService.getVerificationLink(
        emailId,
        token
      )
      if (!verificationLink) {
        throw new Error('Could not find verification link in email')
      }

      // Step 5: Complete verification
      logger.text = 'Completing verification...'
      const verifyCommand = registerCommand.replace('@LINK@', verificationLink)
      const verificationResult = await this.tools.system.exec(verifyCommand)

      if (verificationResult.includes('registered successfully!')) {
        this.accounts.push(`${email},${CONFIG.PASSWORD}`)
        logger.succeed(`Account created successfully: ${email}`)
        return true
      } else {
        throw new Error('Verification failed')
      }
    } catch (error) {
      logger.fail(`Account creation failed: ${error.message}`)
      return false
    }
  }

  async saveAccounts(): Promise<void> {
    if (this.accounts.length === 0) {
      this.tools.print.info('No accounts to save')
      return
    }

    const logger = this.tools.print.spin('Saving accounts to file...')
    try {
      // Ensure directory exists
      await this.tools.filesystem.dirAsync('generated')
      await this.tools.filesystem.appendAsync(
        CONFIG.OUTPUT_FILE_PATH,
        this.accounts.join('\n')
      )
      logger.succeed(
        `Saved ${this.accounts.length} accounts to ${CONFIG.OUTPUT_FILE_PATH}`
      )
    } catch (error) {
      logger.fail(`Failed to save accounts: ${error.message}`)
    }
  }

  getCreatedAccountsCount(): number {
    return this.accounts.length
  }
}

// Main command
const command: GluegunCommand = {
  name: 'create-accounts-2',
  alias: ['r2'],
  run: async (toolbox) => {
    const { print, system, prompt } = toolbox

    // Check requirements
    const requirementsLogger = print.spin('Checking requirements...')
    try {
      await system.exec('megatools reg --help')
      requirementsLogger.succeed('Megatools is installed')
    } catch (error) {
      requirementsLogger.fail(
        'Megatools not installed. Please install it before running this command.'
      )
      return
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

    // Create accounts
    const accountManager = new MegaAccountManager(toolbox)
    print.info(`Starting creation of ${numAccounts} MEGA accounts...`)

    let successful = 0
    // Process accounts sequentially
    for (let i = 1; i <= numAccounts; i++) {
      const accountLogger = print.spin(
        `Creating account ${i}/${numAccounts}...`
      )

      try {
        // Wait for each account creation to complete before moving to the next
        const success = await accountManager.createAccount(accountLogger)
        if (success) successful++
      } catch (error) {
        // Ensure the logger is properly handled even if an unexpected error occurs
        accountLogger.fail(`Unexpected error: ${error.message}`)
      }
    }

    // Save accounts
    await accountManager.saveAccounts()

    // Final summary
    print.success(`\nAccount creation complete!`)
    print.info(`Successfully created: ${successful}/${numAccounts} accounts`)
    print.info(`Failed: ${numAccounts - successful} accounts`)
  },
}

module.exports = command
