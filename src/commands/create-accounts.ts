import { GluegunCommand } from 'gluegun'
import { randomBytes } from 'crypto'
import { Toolbox } from 'gluegun/build/types/domain/toolbox'

let tools: Toolbox

const PASSWORD = 'iamsal275' // at least 8 chars

const findUrl = (string: string): string[] => {
  const regex =
    /\b((?:https?:\/\/|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}\/)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()\[\]{};:'\".,<>?«»""'']))/g
  const url = string.match(regex)
  return url ? url : []
}

class MegaAccount {
  name: string
  password: string
  email: string
  emailToken: string
  verifyCommand: string

  constructor(name: string, password: string) {
    this.name = name
    this.password = password
  }

  async register() {
    return new Promise(async (resolve, reject) => {
      const msg = tools.print.spin(
        `Registering account with name: ${this.name}`
      )
      const mailReq = await tools.http
        .create({ baseURL: 'https://api.guerrillamail.com' })
        .get('/ajax.php?f=get_email_address&lang=en')

      this.email = mailReq.data['email_addr']
      this.emailToken = mailReq.data['sid_token']

      this.verifyCommand = await tools.system.run(
        `megatools reg --scripted --register --email ${this.email} --name ${this.name} --password ${this.password}`
      )
      msg.succeed(`Account registered with email: ${this.email}`)
      resolve('done')
    })
  }

  async verify() {
    return new Promise(async (resolve, reject) => {
      let mailId = null
      const msg = tools.print.spin('Verifying email...')
      for (let i = 0; i < 5; i++) {
        console.log('verify', i, this.email)
        if (mailId !== null) break
        await new Promise((resolve) => setTimeout(resolve, 2000))
        const checkMail = await tools.http
          .create({ baseURL: `https://api.guerrillamail.com` })
          .get(
            `/ajax.php?f=get_email_list&offset=0&sid_token=${this.emailToken}`
          )

        for (const email of checkMail.data['list']) {
          if (email.mail_subject.includes('MEGA')) {
            mailId = email.mail_id
            break
          }
        }
      }

      if (mailId === null) {
        msg.fail('Email verification failed: No verification email received.')
        return
      }
      const viewMail = await tools.http
        .create({ baseURL: `https://api.guerrillamail.com` })
        .get(
          `/ajax.php?f=fetch_email&email_id=${mailId}&sid_token=${this.emailToken}`
        )
      const mailBody = viewMail.data['mail_body']
      const links = findUrl(mailBody)

      this.verifyCommand = this.verifyCommand.replace('@LINK@', links[2])

      tools.system
        .exec(this.verifyCommand)
        .then((result) => {
          msg.succeed('Email verified.')

          if (result.includes('registered successfully!')) {
            tools.print.success(
              `Account created: ${this.email} - ${this.password}`
            )
            tools.filesystem.append(
              'generated/accounts.csv',
              `${this.email},${this.password}\n`
            )
            resolve('done')
          } else {
            reject()
          }
        })
        .catch((e) => {
          msg.fail('Email verification failed.')
          reject('failed')
        })
    })
  }
}

const newAccount = async () => {
  return new Promise(async (resolve, reject) => {
    const name = randomBytes(6).toString('hex')
    const acc = new MegaAccount(name, PASSWORD)

    try {
      await acc.register()

      await acc.verify()
      resolve('done')
    } catch (e) {
      reject('failed')
    }
  })
}

const command: GluegunCommand = {
  name: 'create-accounts',
  alias: ['r'],
  run: async (toolbox) => {
    tools = toolbox
    const { print, system, prompt } = toolbox
    const logger = print.spin('Checking requirements...')
    system
      .exec('megatools reg --help')
      .then(async (result) => {
        logger.succeed()
        const answer = await prompt.ask({
          name: 'numAcc',
          type: 'input',
          message: 'How many accounts do you want to create?',
        })

        const numAcc = Number(answer.numAcc)
        tools.print.highlight(`Creating ${numAcc} mega accounts..`)
        tools.print.divider()
        for (let count = 0; count < numAcc; count++) {
          try {
            await newAccount()
          } catch (e) {
            tools.print.error('failed to create account-' + count)
          }
        }
        return
      })
      .catch((e) => {
        logger.fail('Megatools not installed.')
      })
  },
}

module.exports = command
