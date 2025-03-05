import { GluegunCommand } from 'gluegun'
import {
  serveDLNA,
  serveDocker,
  serveFTP,
  serveHTTP,
  serveNFS,
  serveRestic,
  serveS3,
  serveSFTP,
  serveWebDAV,
} from '../../helpers/serve-methods'

const command: GluegunCommand = {
  name: 'serve',
  description: 'Serve MEGA storage via various protocols',
  run: async (toolbox) => {
    const { print, prompt } = toolbox

    // Get accounts
    const accounts = await toolbox.mega.listAccounts()
    if (accounts.length === 0) {
      print.error('No accounts found. Please create an account first.')
      return
    }

    // Select protocol
    const { protocol } = await prompt.ask({
      type: 'select',
      name: 'protocol',
      message: 'Select serving protocol:',
      choices: [
        { name: 'dlna', message: 'DLNA Server' },
        { name: 'docker', message: 'Docker Volume Plugin' },
        { name: 'ftp', message: 'FTP Server' },
        { name: 'http', message: 'HTTP Server' },
        { name: 'nfs', message: 'NFS Mount' },
        { name: 'restic', message: 'Restic REST API' },
        { name: 's3', message: 'S3 Compatible Server' },
        { name: 'sftp', message: 'SFTP Server' },
        { name: 'webdav', message: 'WebDAV Server' },
      ],
    })

    // Get port number for protocols that need it
    let port
    if (['ftp', 'http', 'restic', 's3', 'sftp', 'webdav'].includes(protocol)) {
      const portResponse = await prompt.ask({
        type: 'input',
        name: 'port',
        message: `Enter port number for ${protocol.toUpperCase()} server:`,
        initial: (() => {
          switch (protocol) {
            case 'ftp':
              return '2121'
            case 'http':
              return '8080'
            case 'restic':
              return '8000'
            case 's3':
              return '8333'
            case 'sftp':
              return '2222'
            case 'webdav':
              return '8080'
            default:
              return '8080'
          }
        })(),
      })
      port = parseInt(portResponse.port, 10)
    }

    // Get authentication for protocols that support it
    let user, pass
    if (['ftp', 'http', 'sftp', 'webdav'].includes(protocol)) {
      const auth = await prompt.ask([
        {
          type: 'input',
          name: 'user',
          message: 'Enter username (optional):',
        },
        {
          type: 'input',
          name: 'pass',
          message: 'Enter password (optional):',
          skip: (answers: any) => !answers.user,
        },
      ])
      user = auth.user
      pass = auth.pass
    }

    try {
      print.info(`Starting ${protocol.toUpperCase()} server...`)

      const config = {
        port,
        user,
        pass,
      }

      let serverProcess
      switch (protocol) {
        case 'dlna':
          serverProcess = await serveDLNA(toolbox, config)
          break
        case 'docker':
          serverProcess = await serveDocker(toolbox, config)
          break
        case 'ftp':
          serverProcess = await serveFTP(toolbox, config)
          break
        case 'http':
          serverProcess = await serveHTTP(toolbox, config)
          break
        case 'nfs':
          serverProcess = await serveNFS(toolbox, config)
          break
        case 'restic':
          serverProcess = await serveRestic(toolbox, config)
          break
        case 's3':
          serverProcess = await serveS3(toolbox, config)
          break
        case 'sftp':
          serverProcess = await serveSFTP(toolbox, config)
          break
        case 'webdav':
          serverProcess = await serveWebDAV(toolbox, config)
          break
      }

      if (serverProcess) {
        print.success(
          `${protocol.toUpperCase()} server started successfully. Press Ctrl+C to stop.`
        )
      }
    } catch (error) {
      print.error(
        `Failed to start ${protocol.toUpperCase()} server: ${error.message}`
      )
    }
  },
}

module.exports = command
