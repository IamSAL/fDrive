import { GluegunCommand } from 'gluegun'
import { serveRestic } from '../../helpers/serve-methods'

const command: GluegunCommand = {
  name: 'restic',
  description: 'Serve MEGA storage via Restic',
  run: async (toolbox) => {
    const { print, prompt } = toolbox

    const { port } = await prompt.ask([
      {
        type: 'input',
        name: 'port',
        message: 'Enter port number:',
        initial: '8000',
      },
    ])

    try {
      print.info('Starting Restic server...')
      await serveRestic(toolbox, { port: Number(port) })
      print.success('Restic server started successfully. Press Ctrl+C to stop.')
    } catch (error) {
      print.error(`Failed to start Restic server: ${error.message}`)
    }
  },
}

module.exports = command
