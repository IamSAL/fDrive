import { GluegunCommand } from 'gluegun'
import { serveNFS } from '../../helpers/serve-methods'

const command: GluegunCommand = {
  name: 'nfs',
  description: 'Serve MEGA storage via NFS',
  run: async (toolbox) => {
    const { print } = toolbox

    try {
      print.info('Starting NFS server...')
      await serveNFS(toolbox, {})
      print.success('NFS server started successfully. Press Ctrl+C to stop.')
    } catch (error) {
      print.error(`Failed to start NFS server: ${error.message}`)
    }
  },
}

module.exports = command
