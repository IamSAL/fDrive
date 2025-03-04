import { GluegunCommand } from 'gluegun'

const command: GluegunCommand = {
  name: 'verify',
  description: 'Verify status of specific MEGA accounts',
  run: async (toolbox) => {
    const { print, prompt } = toolbox

    const accounts = await toolbox.mega.listAccounts()
    if (accounts.length === 0) {
      print.error('No accounts found to verify.')
      return
    }

    const { selectedEmails } = await prompt.ask({
      type: 'multiselect',
      name: 'selectedEmails',
      message: 'Select accounts to verify',
      choices: accounts.map((acc) => acc.email),
    })

    if (!selectedEmails || selectedEmails.length === 0) {
      print.info('No accounts selected for verification.')
      return
    }

    print.info('\nVerifying selected accounts...')
    print.info('----------------------------')

    for (const email of selectedEmails) {
      const verifyLogger = print.spin(`Verifying ${email}...`)
      const status = await toolbox.mega.getAccountStatus(email)

      switch (status) {
        case 'active':
          verifyLogger.succeed(`${email} is active and working properly`)
          break
        case 'inactive':
          verifyLogger.warn(`${email} is inactive or has issues`)
          break
        case 'error':
          verifyLogger.fail(`${email} encountered an error during verification`)
          break
      }
    }

    print.info('\nVerification complete!')
  },
}

module.exports = command
