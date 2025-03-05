import { GluegunCommand } from 'gluegun'
import { serveUI } from '../../helpers/serve-methods'
import { inputUserPass } from '../../helpers/misc'

const command: GluegunCommand = {
  name: 'ui',
  description: 'Serve Web UI',
  run: async (toolbox) => {
    const { print, prompt } = toolbox

    const { port } = await prompt.ask([
      {
        type: 'input',
        name: 'port',
        message: 'Enter port number:',
        initial: '2121',
      },
    ])

    const { user, pass } = await inputUserPass(toolbox)
    try {
      print.info('Starting FTP server...')
      await serveUI(toolbox, { port: Number(port), user, pass })
      print.success('FTP server started successfully. Press Ctrl+C to stop.')
    } catch (error) {
      print.error(`Failed to start FTP server: ${error.message}`)
    }
  },
}

module.exports = command
