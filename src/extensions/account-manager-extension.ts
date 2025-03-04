import { GluegunToolbox } from 'gluegun'
import { CONFIG } from '../config/account-config'

const urlRegex =
  /\b((?:https?:\/\/|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}\/)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()\[\]{};:'".,<>?«»""'']))/g

const findUrls = (text: string): string[] => {
  const matches = text.match(urlRegex)
  return matches || []
}

const generateRandomUsername = (): string => {
  return `user_${Math.random().toString(36).substring(2, 10)}`
}

module.exports = (toolbox: GluegunToolbox) => {
  toolbox.account = {
    findUrls,
    generateRandomUsername,
    async createAccount(email: string, logger: any): Promise<boolean> {
      try {
        const username = generateRandomUsername()
        logger.text = `Creating new account: ${username}...`

        // Register with MEGA
        logger.info(`Registering: ${email}`)
        const registerCommand = await toolbox.system.run(
          `megatools reg --scripted --register --email ${email} --name ${username} --password ${CONFIG.PASSWORD}`
        )

        return true
      } catch (error) {
        logger.fail(`Account creation failed: ${error.message}`)
        return false
      }
    },
    async saveAccounts(
      accounts: Array<{ email: string; password: string }>
    ): Promise<void> {
      if (accounts.length === 0) {
        toolbox.print.info('No accounts to save')
        return
      }

      const logger = toolbox.print.spin('Saving accounts to file...')
      try {
        // Ensure directory exists
        await toolbox.filesystem.dirAsync('generated')

        // Transform accounts data
        const accountsData = accounts.map((account) => ({
          ...account,
          created_at: new Date().toISOString(),
        }))

        // Save as JSON file
        await toolbox.filesystem.writeAsync(
          CONFIG.OUTPUT_FILE_PATH,
          JSON.stringify(accountsData, null, 2)
        )

        await toolbox.template.generate({
          template: 'accounts.ts.ejs',
          target: `generated/accounts.html`,
          props: { accounts: accountsData },
        })

        logger.succeed(
          `Saved ${accounts.length} accounts to ${CONFIG.OUTPUT_FILE_PATH}`
        )
      } catch (error) {
        logger.fail(`Failed to save accounts: ${error.message}`)
      }
    },
  }
}

declare module 'gluegun' {
  interface GluegunToolbox {
    account: {
      findUrls: (text: string) => string[]
      generateRandomUsername: () => string
      createAccount: (email: string, logger: any) => Promise<boolean>
      saveAccounts: (
        accounts: Array<{ email: string; password: string }>
      ) => Promise<void>
    }
  }
}
