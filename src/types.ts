// export types
export interface IConfig {
  PASSWORD: string
  MAX_EMAIL_CHECK_ATTEMPTS: number
  EMAIL_CHECK_INTERVAL_MS: number
  OUTPUT_FILE_PATH: string
  CONCURRENT_LIMIT: number
  MAX_ACCOUNTS: number
  IS_MOUNTED: boolean
  MOUNT_PATHS: string[]
  [x: string]: any
}
