import { GluegunCommand } from 'gluegun'

const command: GluegunCommand = {
  name: 'accounts',
  description: 'Manage MEGA accounts',
  run: async (toolbox) => {
    await toolbox.menu.showMenu('accounts')
  },
}

module.exports = command
