import { GluegunMenuToolbox } from '@lenne.tech/gluegun-menu'
import { GluegunCommand } from 'gluegun'
import { showMenu } from '../helpers/misc'

const command: GluegunCommand = {
  name: 'free-drive',
  alias: 'fd',
  hidden: true,
  run: async (toolbox: GluegunMenuToolbox) => {
    await showMenu(toolbox)
  },
}

module.exports = command
