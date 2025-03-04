const fs = require('fs')
const csv = require('csv-parser')
const mega = require('megajs')

// Function to login to Mega account
function loginToMega(email, password) {
  return new Promise((resolve, reject) => {
    const storage = new mega.Storage({
      email: email,
      password: password,
    })

    storage.on('ready', () => {
      resolve(`Logged In: ${email}`)
    })

    storage.on('error', (err) => {
      reject(`Error: ${email} - ${err.message}`)
    })
  })
}

// Function to delay execution
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// Read and parse the CSV file
async function processCSV() {
  const rows = []
  fs.createReadStream('accounts.csv')
    .pipe(csv({ headers: false }))
    .on('data', (row) => {
      rows.push(row)
    })
    .on('end', async () => {
      for (const row of rows) {
        // console.dir(row, { depth: Infinity });
        const email = row[0].trim()
        const password = row[1].trim()

        try {
          const message = await loginToMega(email, password)
          console.log(message)
        } catch (error) {
          console.log(`Error: ${email} - ${error.message}`)
        }

        // Throttle: wait for 3 seconds before the next request
        await delay(1000)
      }
      console.log('CSV file successfully processed')
      process.exit(0) // End the process
    })
}

processCSV()
