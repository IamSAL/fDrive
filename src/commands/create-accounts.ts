import { GluegunCommand } from 'gluegun'
import { randomBytes } from 'crypto'
import { Storage } from 'megajs'
import axios from 'axios'

const PASSWORD = 'iamsal275' // at least 8 chars

const findUrl = (string: string): string[] => {
  const regex =
    /(?:i)\b((?:https?:\/\/|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}\/)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()\[\]{};:'\".,<>?«»“”‘’]))/g
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
    const mailReq = await axios.get(
      'https://api.guerrillamail.com/ajax.php?f=get_email_address&lang=en'
    )
    this.email = mailReq.data.email_addr
    this.emailToken = mailReq.data.sid_token

    const storage = new Storage({
      email: this.email,
      password: this.password,
      secondFactorCode: 'test',
      autologin: false,
    })
    await storage.ready
    await storage.login()
    // megatools reg --scripted --register --email self.email --name self.name --password self.password
    this.verifyCommand = `megajs --email ${this.email} --password ${this.password} --name ${this.name}`
  }

  async verify() {
    let mailId = null
    for (let i = 0; i < 5; i++) {
      if (mailId !== null) break
      await new Promise((resolve) => setTimeout(resolve, 3000))
      const checkMail = await axios.get(
        `https://api.guerrillamail.com/ajax.php?f=get_email_list&offset=0&sid_token=${this.emailToken}`
      )
      console.log(checkMail.data, this.emailToken)
      for (const email of checkMail.data.list) {
        if (email.mail_subject.includes('MEGA')) {
          mailId = email.mail_id
          break
        }
      }
    }

    if (mailId === null) return
    const viewMail = await axios.get(
      `https://api.guerrillamail.com/ajax.php?f=fetch_email&email_id=${mailId}&sid_token=${this.emailToken}`
    )
    const mailBody = viewMail.data.mail_body
    console.log(mailBody)
    const links = findUrl(mailBody)

    this.verifyCommand = this.verifyCommand.replace('@LINK@', links[2])
    console.log('skip verify')
    // const verification = await new Promise((resolve, reject) => {
    //   const { exec } = require('child_process')
    //   exec(this.verifyCommand, (error, stdout) => {
    //     if (error) reject(error)
    //     resolve(stdout)
    //   })
    // })

    // if (verification.includes('registered successfully!')) {
    //   console.log('Success. Acc Deets are:')
    //   console.log(`${this.email} - ${this.password}`)

    //   appendFileSync(
    //     'accounts.csv',
    //     `${this.email},${this.password},${this.name},-\n`
    //   )
    // } else {
    //   console.log('Failed.')
    // }
  }
}

const newAccount = async () => {
  const name = randomBytes(6).toString('hex')
  const acc = new MegaAccount(name, PASSWORD)
  await acc.register()
  console.log('Registered. Waiting for verification email...')
  await acc.verify()
}

const command: GluegunCommand = {
  name: 'create-accounts',
  alias: ['r'],
  run: async (toolbox) => {
    const { print, system } = toolbox
    //check megatools installation
    //nstall megatools on platform
    const logger = print.spin('Account creation process started.')
    system.run('megatools --version')
    logger.succeed('Megatools installed.')

    const numAcc = 1
    for (let count = 0; count < numAcc; count++) {
      newAccount()
    }
  },
}

module.exports = command
