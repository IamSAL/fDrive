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

    print.info('\nMEGA Accounts:' + accounts.length)
    print.divider()
    print.table(
      [
        Object.keys(accounts[0] || {}),
        ...accounts.map((acc) => Object.values(acc)),
      ],
      { format: 'lean' }
    )
  },
}

module.exports = command
