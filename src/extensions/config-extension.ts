import { GluegunToolbox } from 'gluegun'
import * as path from 'path'
module.exports = (toolbox: GluegunToolbox) => {
  toolbox.filesystem.exists('generated')
  toolbox.config = {
    ...toolbox.config,
    ...toolbox.config.loadConfig('free-drive', process.cwd()),
    ...toolbox.config.loadConfig(
      'custom',
      path.join(process.cwd(), 'generated')
    ),
  }
}
