import { GluegunCommand } from 'gluegun'
import { serveSFTP } from '../../helpers/serve-methods'
import { inputUserPass } from '../../helpers/misc'

const command: GluegunCommand = {
  name: 'sftp',
  description: 'Serve MEGA storage via SFTP',
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
      print.info('Starting SFTP server...')
      await serveSFTP(toolbox, { port: Number(port), user, pass })
      print.success('SFTP server started successfully. Press Ctrl+C to stop.')
    } catch (error) {
      print.error(`Failed to start SFTP server: ${error.message}`)
    }
  },
}

module.exports = command
