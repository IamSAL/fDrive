import { GluegunCommand } from 'gluegun'
import { serveDocker } from '../../helpers/serve-methods'

const command: GluegunCommand = {
  name: 'docker',
  description: 'Serve MEGA storage via Docker',
  run: async (toolbox) => {
    const { print } = toolbox

    try {
      print.info('Starting Docker server...')
      await serveDocker(toolbox, {})
      print.success('Docker server started successfully. Press Ctrl+C to stop.')
    } catch (error) {
      print.error(`Failed to start Docker server: ${error.message}`)
    }
  },
}

module.exports = command
