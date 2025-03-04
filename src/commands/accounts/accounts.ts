import { GluegunCommand } from 'gluegun'
import { showMenu } from '../../helpers/misc'

const command: GluegunCommand = {
  name: 'accounts',
  description: 'Manage MEGA accounts',
  run: async (toolbox) => {
    await showMenu(toolbox, 'accounts')
  },
}

module.exports = command
