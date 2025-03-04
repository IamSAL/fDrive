import { GluegunCommand } from 'gluegun'
import { Toolbox } from 'gluegun/build/types/domain/toolbox'
import { InstallMegatools } from '../helpers/install-megatools'

// Configuration
const CONFIG = {
  PASSWORD: 'PA$$WORD1235', // at least 8 chars
  MAX_EMAIL_CHECK_ATTEMPTS: 5,
  EMAIL_CHECK_INTERVAL_MS: 5000,
  OUTPUT_FILE_PATH: 'generated/accounts.json',
  CONCURRENT_LIMIT: 50,
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
  private tools: Toolbox
  private api: any
  constructor(toolbox: Toolbox) {
    this.tools = toolbox
    this.api = this.tools.http.create({
      baseURL: 'https://api.guerrillamail.com',
    })
  }
  async getEmailAddress(): Promise<{ email: string; token: string }> {
    const mailReq = await this.api.get('/ajax.php?f=get_email_address&lang=en')

    return {
      email: mailReq.data['email_addr'],
      token: mailReq.data['sid_token'],
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

      const response = await this.api.get(
        `/ajax.php?f=get_email_list&offset=0&sid_token=${emailToken}`
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
    const response = await this.api.get(
      `/ajax.php?f=fetch_email&email_id=${emailId}&sid_token=${emailToken}`
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
    this.mailService = new GuerrillaMailService(toolbox)
  }

  private async processAccountBatch(
    batch: number[],
    totalAccounts: number,
    startIndex: number
  ): Promise<number> {
    const promises = batch.map(async (i) => {
      const accountLogger = this.tools.print.spin().stop()
      try {
        const success = await this.createAccount(accountLogger)
        return success ? 1 : 0
      } catch (error) {
        accountLogger.fail(`Unexpected error: ${error.message}`)
        return 0
      }
    })

    const results = await Promise.all(promises)
    return results.reduce((sum, val) => sum + val, 0)
  }

  async createAccountsInParallel(numAccounts: number): Promise<number> {
    let successful = 0
    let startIndex = 0

    while (startIndex < numAccounts) {
      const batchSize = Math.min(
        CONFIG.CONCURRENT_LIMIT,
        numAccounts - startIndex
      )
      const batch = Array.from({ length: batchSize }, (_, i) => startIndex + i)

      successful += await this.processAccountBatch(
        batch,
        numAccounts,
        startIndex
      )
      startIndex += batchSize
    }

    return successful
  }

  async createAccount(logger: any): Promise<boolean> {
    try {
      const username = generateRandomUsername()
      logger.text = `Creating new account: ${username}...`

      // Step 1: Get email address with unique token for this account
      logger.text = 'Getting temporary email addresses...'
      const { email, token } = await this.mailService.getEmailAddress()

      // Step 2: Register with MEGA
      logger.info(`Registering: ${email}`)
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

      // Transform accounts data to JSON format
      const accountsData = this.accounts.map((account) => {
        const [email, password] = account.split(',')
        return {
          email,
          password,
          created_at: new Date().toISOString(),
        }
      })

      // Save as JSON file
      const jsonFilePath = CONFIG.OUTPUT_FILE_PATH
      await this.tools.filesystem.writeAsync(
        jsonFilePath,
        JSON.stringify(accountsData, null, 2)
      )

      await this.tools.template.generate({
        template: 'accounts.ts.ejs',
        target: `generated/accounts.html`,
        props: { accounts: accountsData },
      })

      logger.succeed(
        `Saved ${this.accounts.length} accounts to ${jsonFilePath}`
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
  name: 'create-accounts',
  alias: ['r'],
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

    // Create accounts
    const accountManager = new MegaAccountManager(toolbox)
    print.info(`Starting creation of ${numAccounts} MEGA accounts...`)

    const successful = await accountManager.createAccountsInParallel(
      numAccounts
    )

    // Save accounts
    await accountManager.saveAccounts()

    // Final summary

    print.success(
      `\nSuccessfully created: ${successful}/${numAccounts} accounts`
    )
    print.info(`Failed: ${numAccounts - successful} accounts`)
    process.exit(0)
  },
}

module.exports = command
