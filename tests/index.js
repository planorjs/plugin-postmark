import assert from 'assert'
import {Planor, PlanorService, PlanorTemplate} from '@planorjs/core'
import PlanorServicePostmark from '../src/index.js'
import credentials from '../credentials.js'

const planor = new Planor()

const emailTemplate = new PlanorTemplate('email', 'VERIFY_SIGNIN', 'en_US', [
  'Your {{project}} Verification Code',
  'You have requested to signin to {{project}} and your verification code is "{{code}}"'
])
planor.addTemplate(emailTemplate)

await planor.addService(new PlanorServicePostmark(credentials.postmark))

planor.updateTemplateLiterals({project: 'SomeApp'})

const result = await planor.sendEmail('VERIFY_SIGNIN', {to: credentials.gmail.sender}, {code: '918273'})

console.log(result)
console.log(planor.getErrors())

assert.strictEqual(typeof result.id, 'string')
