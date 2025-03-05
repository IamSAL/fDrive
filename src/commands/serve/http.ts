import { GluegunCommand } from 'gluegun'
import { serveHTTP } from '../../helpers/serve-methods'
import { inputUserPass } from '../../helpers/misc'

const command: GluegunCommand = {
  name: 'http',
  description: 'Serve MEGA storage via HTTP',
  run: async (toolbox) => {
    const { print, prompt } = toolbox

    const { port } = await prompt.ask([
      {
        type: 'input',
        name: 'port',
        message: 'Enter port number:',
        initial: '8080',
      },
    ])
    const { user, pass } = await inputUserPass(toolbox)

    try {
      print.info('Starting HTTP server...')
      await serveHTTP(toolbox, { port: Number(port), user, pass })
      print.success('HTTP server started successfully. Press Ctrl+C to stop.')
    } catch (error) {
      print.error(`Failed to start HTTP server: ${error.message}`)
    }
  },
}

module.exports = command
