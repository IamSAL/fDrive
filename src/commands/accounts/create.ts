import { GluegunCommand } from 'gluegun'
import { createAccounts } from '../../helpers/misc'

const command: GluegunCommand = {
  name: 'create',
  description: 'Create new MEGA accounts',
  run: async (toolbox) => {
    const input = await toolbox.prompt.ask({
      name: 'count',
      type: 'input',
      message: 'Enter custom size in GB',
      format(value) {
        return `${value} GB`
      },
      validate(value) {
        const num = parseInt(value, 10)
        if (isNaN(num) || num <= 0) {
          return 'Please enter a valid number greater than 0'
        }
        return true
      },
    })
    await createAccounts(toolbox, parseInt(input.count, 10))
  },
}

module.exports = command
