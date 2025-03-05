import { GluegunCommand } from 'gluegun'
import { serveDLNA } from '../../helpers/serve-methods'

const command: GluegunCommand = {
  name: 'dlna',
  description: 'Serve MEGA storage via DLNA',
  run: async (toolbox) => {
    const { print } = toolbox

    try {
      print.info('Starting DLNA server...')
      await serveDLNA(toolbox, {})
      print.success('DLNA server started successfully. Press Ctrl+C to stop.')
    } catch (error) {
      print.error(`Failed to start DLNA server: ${error.message}`)
    }
  },
}

module.exports = command
