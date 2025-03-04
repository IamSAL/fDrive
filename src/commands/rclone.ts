import { GluegunCommand } from 'gluegun'
import { promises as rclone } from 'rclone.js'
import * as path from 'path'

const command: GluegunCommand = {
  name: 'rclone',
  description: '(Advanced) run custom rclone commands',
  run: async (toolbox) => {
    const configDir = path.join(process.cwd(), 'generated')
    const configPath = path.join(configDir, 'rclone.conf')
    toolbox.print.muted(`Running command: rclone ${toolbox.parameters.string}`)

    try {
      const result = await rclone(
        ...toolbox.parameters.string.split(' '),

        {
          'max-depth': 1,
          // Spawn options:
          env: {
            RCLONE_CONFIG: configPath,
          },
          shell: '/bin/sh',
        }
      )

      // Convert Buffer to string and display
      if (Buffer.isBuffer(result)) {
        toolbox.print.info(result.toString('utf-8'))
      } else {
        toolbox.print.info(result)
      }
    } catch (error) {
      toolbox.print.error(`Command failed: `)
      if (Buffer.isBuffer(error)) {
        toolbox.print.info(error.toString('utf-8'))
      } else {
        toolbox.print.info(error)
      }
    }
  },
}

module.exports = command
