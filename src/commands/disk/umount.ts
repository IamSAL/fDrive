import { GluegunCommand } from 'gluegun'
import { updateConfig } from '../../helpers/misc'
import { checkOS } from '../../helpers/check-os'

const command: GluegunCommand = {
  name: 'unmount',
  description: 'Unmount fDrive mounted directories',
  run: async (toolbox) => {
    const { print, prompt, config } = toolbox

    // Check if there are any mounted paths
    if (!config.MOUNT_PATHS || config.MOUNT_PATHS.length === 0) {
      print.error('No mounted directories found.')
      return
    }

    // Get user selection for paths to unmount
    const { selectedPaths } = await prompt.ask({
      type: 'multiselect',
      name: 'selectedPaths',
      message: 'Select directories to unmount(hit space to select):',
      choices: [...config.MOUNT_PATHS, 'cancel'],
    })

    if (!selectedPaths || selectedPaths.length === 0) {
      print.info('No paths selected for unmounting.')
      return
    }
    if (selectedPaths.includes('cancel')) {
      process.exit(0)
    }

    const unmountInfo = print.spin('Unmounting selected directories...')
    const results = { success: [], failed: [] }

    // Unmount each selected path
    for (const mountDir of selectedPaths) {
      try {
        const { isWindows, isMac, isLinux } = checkOS()

        if (isLinux) {
          // Try fusermount3 first, fallback to fusermount
          try {
            await toolbox.system.run(`fusermount3 -u "${mountDir}"`)
          } catch {
            await toolbox.system.run(`fusermount -u "${mountDir}"`)
          }
        } else if (isMac) {
          await toolbox.system.run(`umount "${mountDir}"`)
        } else {
          // For Windows, use native commands
          await toolbox.system.run(`net use ${mountDir} /delete`)
        }

        results.success.push(mountDir)
      } catch (error) {
        results.failed.push({ path: mountDir, error: error.message })
      }
    }

    // Update config with remaining mounted paths
    const remainingPaths = config.MOUNT_PATHS.filter(
      (path) => !results.success.includes(path)
    )

    await updateConfig(toolbox, {
      IS_MOUNTED: remainingPaths.length > 0,
      MOUNT_PATHS: remainingPaths,
    })

    // Show results
    unmountInfo.stop()

    if (results.success.length > 0) {
      print.success('\nSuccessfully unmounted:')
      results.success.forEach((path) => print.info(`- ${path}`))
    }

    if (results.failed.length > 0) {
      print.error('\nFailed to unmount:')
      results.failed.forEach(({ path, error }) =>
        print.error(`- ${path} (Error: ${error})`)
      )
    }
  },
}

module.exports = command
