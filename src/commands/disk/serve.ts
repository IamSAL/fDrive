import { GluegunCommand } from 'gluegun'

const command: GluegunCommand = {
  name: 'serve',
  description: 'Serve MEGA storage via FTP or WebDAV',
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
      message: 'Select account to serve',
      choices: accounts.map((acc) => acc.email),
    })

    // Select protocol
    const { protocol } = await prompt.ask({
      type: 'select',
      name: 'protocol',
      message: 'Select serving protocol:',
      choices: [
        { name: 'ftp', message: 'FTP Server' },
        { name: 'webdav', message: 'WebDAV Server' },
      ],
    })

    // Get port number
    const { port } = await prompt.ask({
      type: 'input',
      name: 'port',
      message: `Enter port number for ${protocol.toUpperCase()} server:`,
      initial: protocol === 'ftp' ? '2121' : '8080',
    })

    print.info(
      `Starting ${protocol.toUpperCase()} server for ${selectedEmail} on port ${port}...`
    )
    // TODO: Implement actual serving logic using rclone
    print.success(`${protocol.toUpperCase()} server started successfully`)
  },
}

module.exports = command
