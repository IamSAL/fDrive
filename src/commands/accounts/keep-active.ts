import { GluegunCommand } from 'gluegun'
import * as path from 'path'
import { Storage } from 'megajs'
import { Toolbox } from 'gluegun/build/types/domain/toolbox'

const loginToMega = (
  account: {
    email: string
    password: string
  },
  toolbox: Toolbox
): Promise<any> => {
  return new Promise(async (resolve, reject) => {
    const storage = new Storage({
      email: account.email,
      password: account.password,
      autologin: true,
    })
    try {
      //   await storage.ready
      const stats = await storage.getAccountInfo()

      resolve(stats)
    } catch (error) {
      reject(error)
    }
  })
}

const delay = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

const command: GluegunCommand = {
  name: 'keep-active',
  description: 'Keep MEGA accounts active by logging in periodically',
  run: async (toolbox) => {
    const { print } = toolbox

    try {
      // Read accounts.json
      const accountsPath = path.join(
        process.cwd(),
        'generated',
        'accounts.json'
      )

      let accounts = []
      if (toolbox.filesystem.exists(accountsPath)) {
        const accountsData = toolbox.filesystem.read(accountsPath, 'utf8')
        accounts = JSON.parse(accountsData)
      } else {
        // Create empty accounts file if it doesn't exist
        toolbox.filesystem.write(accountsPath, '[]')
      }

      print.info('Starting account login check...')

      for (const [idx, account] of Object.entries(accounts) as unknown as any) {
        try {
          const stats = await loginToMega(account, toolbox)

          // Calculate usage percentage by dividing used bandwidth by total bandwidth
          const usagePercentage =
            stats.downloadBandwidthUsed && stats.downloadBandwidthTotal
              ? (stats.downloadBandwidthUsed / stats.downloadBandwidthTotal) *
                100
              : 0
          const bytesToMB = (bytes: number) =>
            bytes ? (bytes / (1024 * 1024)).toFixed(2) + ' MB' : '0'

          accounts[idx] = {
            email: account.email,
            usage: `${usagePercentage.toFixed(2)}%`,
            ...stats,

            downloadBandwidthTotal: bytesToMB(stats.downloadBandwidthTotal),
            downloadBandwidthUsed: bytesToMB(stats.downloadBandwidthUsed),
            sharedBandwidthUsed: bytesToMB(stats.sharedBandwidthUsed),

            ...account,
            last_login: new Date().toISOString(),
          }

          print.success(`Logged in successfully: ${account.email}`)
        } catch (error) {
          print.error(`Failed to login: ${account.email} - ${error.message}`)
        }

        // Throttle requests
        await delay(100)
      }

      // Save updated accounts data
      await toolbox.account.saveAccounts(accounts)

      print.success(
        `All accounts processed. Run "free-drive accounts list" to check status.`
      )
      process.exit(0)
    } catch (error) {
      print.error('Error processing accounts:')
      print.error(error)
      process.exit(1)
    }
  },
}

module.exports = command
