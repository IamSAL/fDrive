import { build } from 'gluegun'

/**
 * Create the cli and kick it off
 */
async function run(argv) {
  // create a CLI runtime
  const cli = build()
    .brand('fdrive')
    .src(__dirname)
    .plugins('./node_modules', { matching: 'fdrive-*', hidden: true })
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
