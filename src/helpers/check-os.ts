import { platform } from 'os'

/**
 * Detects the current operating system
 * @returns An object with boolean flags for isWindows, isMac, and isLinux
 */
export function checkOS() {
  const currentPlatform = platform()

  return {
    isWindows: currentPlatform === 'win32',
    isMac: currentPlatform === 'darwin',
    isLinux: currentPlatform === 'linux',
    platform: currentPlatform,
  }
}
