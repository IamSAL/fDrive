import { GluegunToolbox } from 'gluegun'
import * as path from 'path'
import { getRcloneConfig } from '../helpers/misc'

module.exports = async (toolbox: GluegunToolbox) => {
  const rcloneConf = await getRcloneConfig()
  toolbox.config = {
    ...toolbox.config,
    ...toolbox.config.loadConfig('free-drive', process.cwd()),
    ...toolbox.config.loadConfig(
      'custom',
      path.join(process.cwd(), 'generated')
    ),
    rclone: rcloneConf,
    isSetup: Object.keys(rcloneConf).length > 0,
  }
}
