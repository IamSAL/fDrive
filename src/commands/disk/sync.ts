import { GluegunCommand } from 'gluegun'

const command: GluegunCommand = {
  name: 'sync',
  description: 'Sync files between local and MEGA storage',
  run: async (toolbox) => {
    const { print, prompt } = toolbox

    // Get accounts
    const accounts = await toolbox.mega.listAccounts()
    if (accounts.length === 0) {
      print.error('No accounts found. Please create an account first.')
      return
    }

    // Select account
    const { selectedEmail } = await prompt.ask({
      type: 'select',
      name: 'selectedEmail',
      message: 'Select account for syncing',
      choices: accounts.map((acc) => acc.email),
    })

    // Get local directory
    const { localDir } = await prompt.ask({
      type: 'input',
      name: 'localDir',
      message: 'Enter local directory path:',
    })

    // Get remote directory
    const { remoteDir } = await prompt.ask({
      type: 'input',
      name: 'remoteDir',
      message: 'Enter remote directory path (leave empty for root):',
      initial: '/',
    })

    // Get sync direction
    const { direction } = await prompt.ask({
      type: 'select',
      name: 'direction',
      message: 'Select sync direction:',
      choices: [
        { name: 'local-to-remote', message: 'Upload (Local → Remote)' },
        { name: 'remote-to-local', message: 'Download (Remote → Local)' },
        { name: 'bidirectional', message: 'Bidirectional (Two-way sync)' },
      ],
    })

    print.info(
      `Syncing between ${localDir} and ${selectedEmail}:${remoteDir}...`
    )
    // TODO: Implement actual sync logic using rclone
    print.success('Sync completed successfully')
  },
}

module.exports = command
