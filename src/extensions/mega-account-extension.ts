import { GluegunToolbox } from 'gluegun'
import { CONFIG } from '../config/account-config'
import * as path from 'path'

module.exports = (toolbox: GluegunToolbox) => {
  toolbox.mega = {
    async verifyAccount(email: string): Promise<boolean> {
      const { system, print } = toolbox
      try {
        const result = await system.exec(
          `megatools ls --username=${email} --password=${CONFIG.PASSWORD}`
        )
        return !result.includes('ERROR')
      } catch (error) {
        print.error(`Failed to verify account ${email}: ${error.message}`)
        return false
      }
    },

    async listAccounts(): Promise<Array<{ email: string; password: string }>> {
      const { filesystem, print } = toolbox
      const accountsPath = path.join(
        process.cwd(),
        'generated',
        'accounts.json'
      )

      try {
        if (!filesystem.exists(accountsPath)) {
          return []
        }
        const accountsData = await filesystem.read(accountsPath)
        return JSON.parse(accountsData)
      } catch (error) {
        print.error(`Failed to read accounts: ${error.message}`)
        return []
      }
    },

    async getAccountStatus(
      email: string
    ): Promise<'active' | 'inactive' | 'error'> {
      try {
        const isValid = await this.verifyAccount(email)
        return isValid ? 'active' : 'inactive'
      } catch (error) {
        return 'error'
      }
    },
  }
}

declare module 'gluegun' {
  interface GluegunToolbox {
    mega: {
      verifyAccount: (email: string) => Promise<boolean>
      listAccounts: () => Promise<Array<{ email: string; password: string }>>
      getAccountStatus: (
        email: string
      ) => Promise<'active' | 'inactive' | 'error'>
    }
  }
}
