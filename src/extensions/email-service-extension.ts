import { GluegunToolbox } from 'gluegun'
import { CONFIG } from '../config/account-config'

module.exports = (toolbox: GluegunToolbox) => {
  toolbox.email = {
    async getEmailAddress(): Promise<{ email: string; token: string }> {
      const api = toolbox.http.create({
        baseURL: 'https://api.guerrillamail.com',
      })

      const mailReq = await api.get('/ajax.php?f=get_email_address&lang=en')

      return {
        email: mailReq.data['email_addr'],
        token: mailReq.data['sid_token'],
      }
    },

    async checkForMegaEmail(
      emailToken: string,
      logger: any
    ): Promise<string | null> {
      const api = toolbox.http.create({
        baseURL: 'https://api.guerrillamail.com',
      })

      for (
        let attempt = 1;
        attempt <= CONFIG.MAX_EMAIL_CHECK_ATTEMPTS;
        attempt++
      ) {
        logger.text = `Checking for verification email (attempt ${attempt}/${CONFIG.MAX_EMAIL_CHECK_ATTEMPTS})...`

        await new Promise((resolve) =>
          setTimeout(resolve, CONFIG.EMAIL_CHECK_INTERVAL_MS)
        )

        const response = await api.get(
          `/ajax.php?f=get_email_list&offset=0&sid_token=${emailToken}`
        )

        for (const email of response.data['list']) {
          if (email.mail_subject.includes('MEGA')) {
            logger.text = `Found MEGA verification email!`
            return email.mail_id
          }
        }
      }

      return null
    },

    async getVerificationLink(
      emailId: string,
      emailToken: string,
      logger: any
    ): Promise<string | null> {
      const api = toolbox.http.create({
        baseURL: 'https://api.guerrillamail.com',
      })

      const response = await api.get(
        `/ajax.php?f=fetch_email&email_id=${emailId}&sid_token=${emailToken}`
      )

      const mailBody = response.data['mail_body']
      const links = toolbox.account.findUrls(mailBody)
      return links.find((link) => link.includes('https://mega.nz/#confirm'))
    },
  }
}

declare module 'gluegun' {
  interface GluegunToolbox {
    email: {
      getEmailAddress: () => Promise<{ email: string; token: string }>
      checkForMegaEmail: (
        emailToken: string,
        logger: any
      ) => Promise<string | null>
      getVerificationLink: (
        emailId: string,
        emailToken: string,
        logger: any
      ) => Promise<string | null>
    }
  }
}
