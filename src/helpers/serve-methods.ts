import { Toolbox } from 'gluegun/build/types/domain/toolbox'
import { runRcloneCommand } from './rclone-runner'

interface ServeConfig {
  port: number
  user?: string
  pass?: string
  addr?: string
  remote?: string
  path?: string
}

const defaultConfig = {
  remote: 'fdrive',
  path: '/',
  addr: 'localhost',
}

const validateRcloneConfig = async (remote: string): Promise<boolean> => {
  try {
    await runRcloneCommand(`config show ${remote}`)
    return true
  } catch (error) {
    return false
  }
}

const getRemoteString = (remote: string, path: string) => {
  return `${remote}:${path}`
}

export const serveDLNA = async (toolbox: Toolbox, config: ServeConfig) => {
  const { remote = defaultConfig.remote, path = defaultConfig.path } = config
  if (!(await validateRcloneConfig(remote))) {
    throw new Error(`Invalid rclone configuration for remote: ${remote}`)
  }
  return runRcloneCommand(`serve dlna ${getRemoteString(remote, path)}`)
}

export const serveDocker = async (toolbox: Toolbox, config: ServeConfig) => {
  const { remote = defaultConfig.remote, path = defaultConfig.path } = config
  if (!(await validateRcloneConfig(remote))) {
    throw new Error(`Invalid rclone configuration for remote: ${remote}`)
  }
  return runRcloneCommand(`serve docker ${getRemoteString(remote, path)}`)
}

export const serveFTP = async (toolbox: Toolbox, config: ServeConfig) => {
  const {
    port,
    user,
    pass,
    remote = defaultConfig.remote,
    path = defaultConfig.path,
    addr = defaultConfig.addr,
  } = config

  if (!(await validateRcloneConfig(remote))) {
    throw new Error(`Invalid rclone configuration for remote: ${remote}`)
  }

  const args = [
    `serve ftp ${getRemoteString(remote, path)}`,
    `--addr ${addr}:${port}`,
  ]

  if (user && pass) {
    args.push(`--user ${user}`, `--pass ${pass}`)
  }

  return runRcloneCommand(args.join(' '))
}

export const serveHTTP = async (toolbox: Toolbox, config: ServeConfig) => {
  const {
    port,
    user,
    pass,
    remote = defaultConfig.remote,
    path = defaultConfig.path,
    addr = defaultConfig.addr,
  } = config

  if (!(await validateRcloneConfig(remote))) {
    throw new Error(`Invalid rclone configuration for remote: ${remote}`)
  }

  const args = [
    `serve http ${getRemoteString(remote, path)}`,
    `--addr ${addr}:${port}`,
  ]

  if (user && pass) {
    args.push(`--user ${user}`, `--pass ${pass}`)
  }

  return runRcloneCommand(args.join(' '))
}

export const serveNFS = async (toolbox: Toolbox, config: ServeConfig) => {
  const { remote = defaultConfig.remote, path = defaultConfig.path } = config
  if (!(await validateRcloneConfig(remote))) {
    throw new Error(`Invalid rclone configuration for remote: ${remote}`)
  }
  return runRcloneCommand(`serve nfs ${getRemoteString(remote, path)}`)
}

export const serveRestic = async (toolbox: Toolbox, config: ServeConfig) => {
  const {
    port,
    remote = defaultConfig.remote,
    path = defaultConfig.path,
    addr = defaultConfig.addr,
  } = config

  if (!(await validateRcloneConfig(remote))) {
    throw new Error(`Invalid rclone configuration for remote: ${remote}`)
  }

  return runRcloneCommand(
    `serve restic ${getRemoteString(remote, path)} --addr ${addr}:${port}`
  )
}

export const serveS3 = async (toolbox: Toolbox, config: ServeConfig) => {
  const {
    port,
    remote = defaultConfig.remote,
    path = defaultConfig.path,
    addr = defaultConfig.addr,
  } = config

  if (!(await validateRcloneConfig(remote))) {
    throw new Error(`Invalid rclone configuration for remote: ${remote}`)
  }

  return runRcloneCommand(
    `serve s3 ${getRemoteString(remote, path)} --addr ${addr}:${port}`
  )
}

export const serveSFTP = async (toolbox: Toolbox, config: ServeConfig) => {
  const {
    port,
    user,
    pass,
    remote = defaultConfig.remote,
    path = defaultConfig.path,
    addr = defaultConfig.addr,
  } = config

  if (!(await validateRcloneConfig(remote))) {
    throw new Error(`Invalid rclone configuration for remote: ${remote}`)
  }

  const args = [
    `serve sftp ${getRemoteString(remote, path)}`,
    `--addr ${addr}:${port}`,
  ]

  if (user && pass) {
    args.push(`--user ${user}`, `--pass ${pass}`)
  }

  return runRcloneCommand(args.join(' '))
}

export const serveWebDAV = async (toolbox: Toolbox, config: ServeConfig) => {
  const {
    port,
    user,
    pass,
    remote = defaultConfig.remote,
    path = defaultConfig.path,
    addr = defaultConfig.addr,
  } = config

  if (!(await validateRcloneConfig(remote))) {
    throw new Error(`Invalid rclone configuration for remote: ${remote}`)
  }

  const args = [
    `serve webdav ${getRemoteString(remote, path)}`,
    `--addr ${addr}:${port}`,
  ]

  if (user && pass) {
    args.push(`--user ${user}`, `--pass ${pass}`)
  }

  return runRcloneCommand(args.join(' '))
}
