import { Toolbox } from 'gluegun/build/types/domain/toolbox'
import { checkOS } from './check-os'

export async function InstallMegatools(toolbox: Toolbox) {
  return new Promise<string>(async (resolve, reject) => {
    const { system, print } = toolbox
    const os = checkOS()
    const logger = print.spin('Installing megatools...')

    try {
      switch (os.platform) {
        case 'linux':
          logger.text = 'Detecting Linux distribution...'
          try {
            // Check for different package managers
            if (
              await system
                .run('which apt')
                .then(() => true)
                .catch(() => false)
            ) {
              // Debian/Ubuntu based
              logger.text = 'Installing megatools using apt...'
              await system.run(
                'sudo apt-get update && sudo apt-get install -y megatools'
              )
            } else if (
              await system
                .run('which dnf')
                .then(() => true)
                .catch(() => false)
            ) {
              // Fedora/RHEL based
              logger.text = 'Installing megatools using dnf...'
              await system.run('sudo dnf install -y megatools')
            } else if (
              await system
                .run('which pacman')
                .then(() => true)
                .catch(() => false)
            ) {
              // Arch Linux based
              logger.text = 'Installing megatools using pacman...'
              await system.run('sudo pacman -Sy megatools')
            } else if (
              await system
                .run('which zypper')
                .then(() => true)
                .catch(() => false)
            ) {
              // openSUSE based
              logger.text = 'Installing megatools using zypper...'
              await system.run('sudo zypper install -y megatools')
            } else {
              throw new Error('No supported package manager found')
            }
            logger.succeed('Megatools installed successfully on Linux')
            resolve('done')
          } catch (error) {
            logger.fail('Package manager installation failed')
            print.info('You can try installing from source:')
            print.info(
              '1. Download source: git clone https://megous.com/git/megatools'
            )
            print.info(
              '2. Install dependencies: meson, glib-2.0, libcurl, openssl'
            )
            print.info(
              '3. Build: cd megatools && meson build && cd build && ninja'
            )
            print.info('4. Install: sudo ninja install')
            reject(error)
          }
          break

        case 'win32':
          // For Windows, we'll inform the user to install manually
          // as there's no standard package manager
          logger.text = 'Windows installation requires manual steps...'
          logger.fail('Automatic installation not supported on Windows')
          print.info(
            'Please download and install megatools from: https://megatools.megous.com/'
          )
          print.info('After installation, ensure megatools is in your PATH')
          reject('Manual installation required on Windows')
          break

        case 'darwin':
          // For macOS using Homebrew
          logger.text = 'Installing megatools on macOS using Homebrew...'
          await system.run('brew install megatools')
          logger.succeed('Megatools installed successfully on macOS')
          resolve('done')
          break

        default:
          logger.fail(`Unsupported platform: ${os.platform}`)
          reject(`Unsupported platform: ${os.platform}`)
          break
      }
    } catch (error) {
      logger.fail(`Failed to install megatools: ${error.message || error}`)
      print.error(
        'Installation failed. You may need to install megatools manually.'
      )

      if (os.platform === 'darwin') {
        print.info('Try running: brew install megatools')
      } else if (os.platform === 'linux') {
        print.info('Try running: sudo apt-get install megatools')
      }

      reject(error)
    }
  })
}
