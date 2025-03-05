import { GluegunCommand } from 'gluegun'
import { showMenu } from '../../helpers/misc'

const command: GluegunCommand = {
  name: 'serve',
  description: 'Serve MEGA storage via various protocols',
  run: async (toolbox) => {
    const { print, prompt, runtime } = toolbox

    // Get accounts
    const accounts = await toolbox.mega.listAccounts()
    if (accounts.length === 0) {
      print.error('No accounts found. Please create an account first.')
      return
    }

    await showMenu(toolbox, 'serve')
  },
}

module.exports = command
