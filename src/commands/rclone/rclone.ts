import { GluegunCommand } from 'gluegun'
import * as path from 'path'
import { runRcloneCommand } from '../../helpers/rclone-runner'

const command: GluegunCommand = {
  name: 'rclone',
  description: 'Run rclone commands with interactive support',
  run: async (toolbox) => {
    const { print, parameters } = toolbox
    const configDir = path.join(process.cwd(), 'generated')
    const configPath = path.join(configDir, 'rclone.conf')

    // If no parameters provided, show help
    if (!parameters.string) {
      parameters.string = 'help'
    }

    print.muted(`Running command: rclone ${parameters.string}`)

    try {
      const result = await runRcloneCommand(parameters.string, {
        configPath,
        maxDepth: 1,
      })

      // print.highlight('Output:')
      // // Handle the output
      // if (result) {
      //   if (Buffer.isBuffer(result)) {
      //     print.info(result.toString('utf-8'))
      //   } else if (typeof result === 'string') {
      //     print.info(result)
      //   } else {
      //     print.info(JSON.stringify(result, null, 2))
      //   }
      // }
    } catch (error) {
      process.exit(1)
    }
  },
}

module.exports = command
