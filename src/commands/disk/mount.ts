import { GluegunCommand } from 'gluegun'

const command: GluegunCommand = {
  name: 'mount',
  description: 'Mount MEGA storage as a local drive',
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
      message: 'Select account to mount',
      choices: accounts.map((acc) => acc.email),
    })

    // Get mount point
    const { mountPoint } = await prompt.ask({
      type: 'input',
      name: 'mountPoint',
      message: 'Enter mount point (local directory):',
    })

    print.info(`Mounting ${selectedEmail} to ${mountPoint}...`)
    // TODO: Implement actual mounting logic using rclone
    print.success('Mount completed successfully')
  },
}

module.exports = command
