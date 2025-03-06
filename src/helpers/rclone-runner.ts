import { spawn } from 'child_process'
import { promises as rclone } from 'rclone.js'
import * as path from 'path'

export interface RcloneRunnerOptions {
  configPath?: string
  maxDepth?: number
  maxRetries?: number
  retryDelay?: number
  [x: string]: any
}

const SPAWN_ALL = true
const DEFAULT_MAX_RETRIES = 3
const DEFAULT_RETRY_DELAY = 1000 // 1 second

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
    retryCount?: number
  }
  status: {
    completed: boolean
    failed: boolean
    exitCode: number | null
    errorType?: 'spawn' | 'execution' | 'timeout' | 'rate_limit' | string
    errorDetails?: string
  }
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function executeWithRetry(
  fn: () => Promise<RcloneCommandResult>,
  maxRetries: number,
  retryDelay: number,
  metadata: any
): Promise<RcloneCommandResult> {
  let lastError: any
  let retryCount = 0

  while (retryCount <= maxRetries) {
    try {
      const result = await fn()
      result.metadata = {
        ...result.metadata,
        retryCount,
      }
      return result
    } catch (error) {
      lastError = error
      const isRateLimit =
        error.errorOutput?.toLowerCase().includes('rate') ||
        error.errorOutput?.toLowerCase().includes('too many requests') ||
        error.errorOutput?.toLowerCase().includes('quota exceeded')

      if (isRateLimit && retryCount < maxRetries) {
        const delay = retryDelay * Math.pow(2, retryCount)
        console.log(
          `Rate limit detected. Retrying in ${delay}ms... (Attempt ${
            retryCount + 1
          }/${maxRetries})`
        )
        await sleep(delay)
        retryCount++
        continue
      }
      throw error
    }
  }

  throw lastError
}

export async function runRcloneCommand(
  command: string,
  options: RcloneRunnerOptions = {}
): Promise<RcloneCommandResult> {
  const startTime = Date.now()
  const configPath =
    options.configPath || path.join(process.cwd(), 'generated', 'rclone.conf')
  const args = command.split(' ')
  const maxRetries = options.maxRetries || DEFAULT_MAX_RETRIES
  const retryDelay = options.retryDelay || DEFAULT_RETRY_DELAY

  const metadata = {
    command,
    args,
    configPath,
    startTime,
  }

  console.info('⌘ ' + command)
  // For interactive commands like ncdu, config, mount etc.
  if (SPAWN_ALL || ['ncdu', 'config', 'mount', 'serve'].includes(args[0])) {
    const spawnWithRetry = () =>
      new Promise<RcloneCommandResult>((resolve, reject) => {
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
                    errorType: errorOutput.toLowerCase().includes('rate')
                      ? 'rate_limit'
                      : 'execution',
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

    return executeWithRetry(
      () => spawnWithRetry(),
      maxRetries,
      retryDelay,
      metadata
    )
  }

  // For non-interactive commands
  const executeRclone = async () => {
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
          errorType: error.message?.toLowerCase().includes('rate')
            ? 'rate_limit'
            : 'execution',
          errorDetails: error instanceof Error ? error.message : String(error),
        },
      }
    }
  }

  return executeWithRetry(executeRclone, maxRetries, retryDelay, metadata)
}
