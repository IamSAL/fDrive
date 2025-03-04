import { GluegunMenuToolbox } from '@lenne.tech/gluegun-menu'
import { GluegunCommand } from 'gluegun'

const command: GluegunCommand = {
  name: 'free-drive',
  hidden: true,
  run: async (toolbox: GluegunMenuToolbox) => {
    await toolbox.menu.showMenu()
  },
}

module.exports = command
