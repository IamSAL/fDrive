import { build } from 'gluegun'

/**
 * Create the cli and kick it off
 */
async function run(argv) {
  // create a CLI runtime
  const cli = build()
    .brand('free-drive')
    .src(__dirname)
    .plugins('./node_modules', { matching: 'free-drive-*', hidden: true })
    .plugin(__dirname + '/../node_modules/@lenne.tech/gluegun-menu/dist', {
      commandFilePattern: ['*.js'],
      extensionFilePattern: ['*.js'],
    })
    .help() // provides default for help, h, --help, -h
    // .version() // provides default for version, v, --version, -v
    .exclude(['meta', 'strings', 'semver', 'patching', 'package-manager'])
    .create()
  // and run it
  const toolbox = await cli.run(argv)

  // send it back (for testing, mostly)
  return toolbox
}

module.exports = { run }
