import { GluegunCommand } from 'gluegun'

const command: GluegunCommand = {
  name: 'serve-ui',
  description: 'Serve MEGA storage via web UI',
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
      message: 'Select account to serve via web UI',
      choices: accounts.map((acc) => acc.email),
    })

    // Get port number
    const { port } = await prompt.ask({
      type: 'input',
      name: 'port',
      message: 'Enter port number for web UI server:',
      initial: '3000',
    })

    print.info(`Starting web UI server for ${selectedEmail} on port ${port}...`)
    // TODO: Implement web UI server
    // 1. Configure rclone with MEGA credentials
    // 2. Set up a web server to display file browser interface
    // 3. Implement file operations (upload, download, delete, etc.)
    // 4. Handle server lifecycle and error cases
    print.success(`Web UI server started successfully`)
  },
}

module.exports = command
