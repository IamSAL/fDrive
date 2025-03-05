import { spawn } from 'child_process'
import { promises as rclone } from 'rclone.js'
import * as path from 'path'

export interface RcloneRunnerOptions {
  configPath?: string
  maxDepth?: number
}
const SPAWN_ALL = true
export interface RcloneCommandResult {
  output?: string
  errorOutput?: string
  error?: Error
  code?: number
  isSuccess?: boolean
  metadata?: {
    command: string
    args: string[]
    configPath: string
    startTime: number
    endTime?: number
    duration?: number
  }
  status: {
    completed: boolean
    failed: boolean
    exitCode: number | null
    errorType?: 'spawn' | 'execution' | 'timeout' | string
    errorDetails?: string
  }
}

export async function runRcloneCommand(
  command: string,
  options: RcloneRunnerOptions = {}
): Promise<RcloneCommandResult> {
  const startTime = Date.now()
  const configPath =
    options.configPath || path.join(process.cwd(), 'generated', 'rclone.conf')
  const args = command.split(' ')

  const metadata = {
    command,
    args,
    configPath,
    startTime,
  }

  // For interactive commands like ncdu, config, mount etc.
  if (SPAWN_ALL || ['ncdu', 'config', 'mount', 'serve'].includes(args[0])) {
    return new Promise((resolve, reject) => {
      let output = ''
      let errorOutput = ''

      const rcloneProcess = spawn('rclone', args, {
        stdio: ['inherit', 'pipe', 'pipe'],
        env: {
          ...process.env,
          RCLONE_CONFIG: configPath,
        },
        shell: true,
      })

      rcloneProcess.stdout.on('data', (data) => {
        const chunk = data.toString()
        output += chunk
        process.stdout.write(chunk)
      })

      rcloneProcess.stderr.on('data', (data) => {
        const chunk = data.toString()
        errorOutput += chunk
        process.stderr.write(chunk)
      })

      rcloneProcess.on('error', (error) => {
        const endTime = Date.now()
        reject({
          output,
          errorOutput,
          error,
          isSuccess: false,
          metadata: {
            ...metadata,
            endTime,
            duration: endTime - startTime,
          },
          status: {
            completed: false,
            failed: true,
            exitCode: null,
            errorType: 'spawn',
            errorDetails: error.message,
          },
        })
      })

      rcloneProcess.on('close', (code) => {
        const endTime = Date.now()
        const result = {
          output,
          errorOutput,
          code,
          isSuccess: code === 0,
          metadata: {
            ...metadata,
            endTime,
            duration: endTime - startTime,
          },
          status: {
            completed: true,
            failed: code !== 0,
            exitCode: code,
            ...(code !== 0
              ? {
                  errorType: 'execution',
                  errorDetails: errorOutput,
                }
              : {}),
          },
        }

        if (code === 0) {
          resolve(result)
        } else {
          reject(result)
        }
      })
    })
  }

  // For non-interactive commands
  try {
    const result = await rclone(...args, {
      'max-depth': options.maxDepth || 1,
      env: {
        RCLONE_CONFIG: configPath,
      },
      shell: true,
    })

    const endTime = Date.now()
    return {
      output: result.toString(),
      isSuccess: true,
      metadata: {
        ...metadata,
        endTime,
        duration: endTime - startTime,
      },
      status: {
        completed: true,
        failed: false,
        exitCode: 0,
      },
    }
  } catch (error) {
    const endTime = Date.now()
    throw {
      error,
      isSuccess: false,
      metadata: {
        ...metadata,
        endTime,
        duration: endTime - startTime,
      },
      status: {
        completed: true,
        failed: true,
        exitCode: 1,
        errorType: 'execution',
        errorDetails: error instanceof Error ? error.message : String(error),
      },
    }
  }
}
