import { GluegunCommand } from 'gluegun'
import * as path from 'path'
import { promises as rclone } from 'rclone.js'
import { createAccounts, inputStorageSize } from '../../helpers/misc'

const command: GluegunCommand = {
  name: 'setup',
  description: 'Generate rclone configuration from account data',
  run: async (toolbox) => {
    const { print, filesystem, prompt, parameters, config } = toolbox
    const accountsPath = path.join(process.cwd(), 'generated', 'accounts.json')
    const configDir = path.join(process.cwd(), 'generated')
    const configPath = path.join(configDir, 'rclone.conf')
    console.log(parameters.first)
    if (parameters.first === 'view') {
      print.info(config)
      return
    }
    const numAccounts = await inputStorageSize(toolbox)
    if (numAccounts == 0 || !numAccounts) {
      return
    }
    await createAccounts(toolbox, numAccounts)

    // Path to accounts data and config directory

    // Check if accounts data exists
    if (!filesystem.exists(accountsPath)) {
      print.error('No accounts data found. Please create accounts first.')
      return
    }

    try {
      // Read accounts data
      const accountsData = JSON.parse(filesystem.read(accountsPath) || '[]')

      if (!Array.isArray(accountsData) || accountsData.length === 0) {
        print.error('No account data found in the file')
        return
      }

      // Generate rclone config content
      let configContent = ''

      for (const account of accountsData) {
        const username = account.email.split('@')[0]
        const encryptedPass = await rclone.obscure(account.password)

        configContent += `[mega_${username}]\ntype = mega\nuser = ${account.email}\npass = ${encryptedPass}\n\n`
      }

      // Create config directory if it doesn't exist
      if (!filesystem.exists(configDir)) {
        filesystem.dir(configDir)
      }

      // Write config file
      filesystem.write(configPath, configContent)
      print.success(`Rclone configuration generated at ${configPath}`)
    } catch (error) {
      print.error(`Failed to generate rclone config: ${error.message}`)
    }
  },
}

module.exports = command
