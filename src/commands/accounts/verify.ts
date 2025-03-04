import { GluegunCommand } from 'gluegun'

const command: GluegunCommand = {
  name: 'verify',
  description: 'Verify status of specific MEGA accounts',
  run: async (toolbox) => {
    const { print, prompt } = toolbox

    let accounts = await toolbox.mega.listAccounts()
    if (accounts.length === 0) {
      print.error('No accounts found to verify.')
      return
    }

    const { selectedEmails } = await prompt.ask({
      type: 'multiselect',
      name: 'selectedEmails',
      message: 'Select accounts to verify',
      choices: accounts
        .filter((acc) => !acc.isVerified)
        .map((acc) => acc.email),
    })

    if (!selectedEmails || selectedEmails.length === 0) {
      print.info('No accounts selected for verification.')
      return
    }

    print.info('\nVerifying selected accounts...')
    print.info('----------------------------')

    for (const email of selectedEmails) {
      const account = accounts.find((acc) => acc.email === email)

      const verificationResult = await toolbox.system.exec(account.verify_ref)

      if (verificationResult.includes('registered successfully!')) {
        account.isVerified = true
      } else {
        account.isVerified = false
      }
      accounts = accounts.map((acc) => (acc.email === email ? account : acc))
    }
    await toolbox.account.saveAccounts(accounts)

    toolbox.accounts.print.info('\nVerification complete!')
  },
}

module.exports = command
