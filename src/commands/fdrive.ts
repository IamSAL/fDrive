import { GluegunCommand } from 'gluegun'
import { showMenu } from '../helpers/misc'
import { Toolbox } from 'gluegun/build/types/domain/toolbox'

const command: GluegunCommand = {
  name: 'fdrive',
  alias: 'fd',
  hidden: true,
  run: async (toolbox: Toolbox) => {
    await showMenu(toolbox)
  },
}

module.exports = command
