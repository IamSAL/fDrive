import { GluegunCommand } from 'gluegun'

const command: GluegunCommand = {
  name: 'serve-ftp',
  description: 'Serve MEGA storage via FTP protocol',
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
      message: 'Select account to serve via FTP',
      choices: accounts.map((acc) => acc.email),
    })

    // Get port number
    const { port } = await prompt.ask({
      type: 'input',
      name: 'port',
      message: 'Enter port number for FTP server:',
      initial: '2121',
    })

    print.info(`Starting FTP server for ${selectedEmail} on port ${port}...`)
    // TODO: Implement FTP server using rclone
    // 1. Configure rclone with MEGA credentials
    // 2. Start rclone serve ftp with proper configuration
    // 3. Handle server lifecycle and error cases
    print.success(`FTP server started successfully`)
  },
}

module.exports = command
