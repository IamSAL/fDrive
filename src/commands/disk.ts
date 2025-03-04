import { GluegunCommand } from 'gluegun'
import { showMenu } from '../helpers/misc'

const command: GluegunCommand = {
  name: 'disk',
  description: 'Manage local and remote disk',
  run: async (toolbox) => {
    await showMenu(toolbox, 'disk')
  },
}

module.exports = command
