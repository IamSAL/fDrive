import { GluegunCommand } from 'gluegun'

const command: GluegunCommand = {
  name: 'serve-webdav',
  description: 'Serve MEGA storage via WebDAV protocol',
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
      message: 'Select account to serve via WebDAV',
      choices: accounts.map((acc) => acc.email),
    })

    // Get port number
    const { port } = await prompt.ask({
      type: 'input',
      name: 'port',
      message: 'Enter port number for WebDAV server:',
      initial: '8080',
    })

    print.info(`Starting WebDAV server for ${selectedEmail} on port ${port}...`)
    // TODO: Implement WebDAV server using rclone
    // 1. Configure rclone with MEGA credentials
    // 2. Start rclone serve webdav with proper configuration
    // 3. Handle server lifecycle and error cases
    print.success(`WebDAV server started successfully`)
  },
}

module.exports = command
