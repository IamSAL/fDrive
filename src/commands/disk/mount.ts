import { GluegunCommand } from 'gluegun'
import { homedir } from 'os'
import * as path from 'path'
import { checkOS } from '../../helpers/check-os'
import { runRcloneCommand } from '../../helpers/rclone-runner'

const command: GluegunCommand = {
  name: 'mount',
  description: 'Mount MEGA storage as a local drive',
  run: async (toolbox) => {
    const { print, prompt } = toolbox

    // Get accounts
    const accounts = await toolbox.mega.listAccounts()
    if (accounts.length === 0) {
      print.error('No accounts found. Please create an account first.')
      return
    }

    // Get mount point
    const { mountPoint } = await prompt.ask({
      type: 'input',
      name: 'mountPoint',
      message: 'Enter mount point (local directory):',
      initial: path.join(homedir(), 'fdrive'),
    })

    // Check OS and FUSE requirements
    const { isWindows, isMac, isLinux } = checkOS()
    const defaultMountPoint = path.join(homedir(), 'fdrive')

    // Suggest default mount point if not provided
    const mountDir = mountPoint || defaultMountPoint

    try {
      toolbox.filesystem.dir(mountDir)
    } catch (error) {
      print.error(`Failed to create mount directory: ${error.message}`)
      return
    }

    // Check FUSE requirements
    let fuseWarning = ''
    if (isWindows) {
      fuseWarning = 'WinFSP (http://www.secfs.net/winfsp/download/)'
    } else if (isMac) {
      fuseWarning = 'macFUSE (https://osxfuse.github.io/)'
    } else if (isLinux) {
      fuseWarning = 'FUSE (install using your package manager)'
    }

    print.warning(
      `\nNOTE: FUSE filesystem is required for mounting.\nPlease ensure you have ${fuseWarning} installed.`
    )

    const remoteName = `fdrive`

    print.info(`\nMounting fdrive to ${mountDir}...`)

    try {
      // Run rclone mount command
      const mountResult = await runRcloneCommand(
        `mount ${remoteName}: "${mountDir}" --daemon --vfs-cache-mode writes`,
        {
          blocking: false,
          wait_ms_before_async: 2000, // Wait for 2 seconds to catch immediate errors
        }
      )

      if (mountResult.status.failed) {
        print.error(
          `Mount failed: ${
            mountResult.errorOutput || mountResult.status.errorDetails
          }`
        )
        return
      }

      print.success(`Successfully mounted ${remoteName} to ${mountDir}`)
      print.info(
        '\nYou can now access your MEGA storage through the mounted directory.'
      )
      print.muted('Use Ctrl+C to unmount and exit.')
    } catch (error) {
      print.error(`Mount operation failed: ${error.message || error}`)
    }
  },
}

module.exports = command
