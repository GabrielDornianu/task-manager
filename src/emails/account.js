const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'gabrieldornianu@gmail.com',
        subject: `Welcome to the task manager app, ${name}`,
        text: 'Hello and welcome to this task manager app'
    })
}

const accountCancellationEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'gabrieldornianu@gmail.com',
        subject: `We are sorry to see you leave, ${name}`,
        text: 'We hope we shall see you soon'
    })
}

module.exports = {
    sendWelcomeEmail,
    accountCancellationEmail
}
