import { GluegunCommand } from 'gluegun'
import { serveS3 } from '../../helpers/serve-methods'

const command: GluegunCommand = {
  name: 's3',
  description: 'Serve MEGA storage via S3',
  run: async (toolbox) => {
    const { print, prompt } = toolbox

    const { port } = await prompt.ask([
      {
        type: 'input',
        name: 'port',
        message: 'Enter port number:',
        initial: '8333',
      },
    ])

    try {
      print.info('Starting S3 server...')
      await serveS3(toolbox, { port: Number(port) })
      print.success('S3 server started successfully. Press Ctrl+C to stop.')
    } catch (error) {
      print.error(`Failed to start S3 server: ${error.message}`)
    }
  },
}

module.exports = command
