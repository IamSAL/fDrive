import { GluegunMenuToolbox } from '@lenne.tech/gluegun-menu'
import { Toolbox } from 'gluegun/build/types/domain/toolbox'

export async function showMenu(
  toolbox: GluegunMenuToolbox | Toolbox,
  parentCommands = '',
  options = { byeMessage: 'Happy Hacking! 👋', showHelp: false }
): Promise<void> {
  await toolbox.menu.showMenu(parentCommands, options)
}
