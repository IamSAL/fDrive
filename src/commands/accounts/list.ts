import { GluegunCommand } from 'gluegun'

const command: GluegunCommand = {
  name: 'list',
  description: 'List all MEGA accounts and their status',
  run: async (toolbox) => {
    const { print } = toolbox

    const accounts = await toolbox.mega.listAccounts()
    if (accounts.length === 0) {
      print.info('No accounts found.')
      return
    }

    print.info('\nMEGA Accounts:')
    print.info('-------------')

    for (const account of accounts) {
      print.info(`${account.email}   ${account.password}`)
    }
    print.info('-------------')
    print.info(`\nTotal accounts: ${accounts.length}`)
  },
}

module.exports = command
