import Mailgen from "mailgen";
import nodemailer from "nodemailer";


const sendEmail = async (options) => {
    const mailgenerator = new Mailgen({
        theme: "default",
        product: {
            name: "taskManager",
            link: "https://taskmanager.com"
        }
    })

    const emailTextual = mailgenerator.generatePlaintext(options.mailgenContent)

    const emailHTML = mailgenerator.generate(options.mailgenContent)

    const Transporter= nodemailer.createTransport({
        host:process.env.MAILTRAP_SMTP_HOST,
        port:process.env.MAILTRAP_SMTP_PORT,
        auth:{
            user:process.env.MAILTRAP_SMTP_USER,
            pass:process.env.MAILTRAP_SMTP_PASS,
        }
    })

    const mail={
        from:"mail.taskmanager@example.com",
        to:options.email,
        subject:options.subject,
        text:emailTextual,
        html:emailHTML
    }

    try {
        await Transporter.sendMail(mail)
    }catch (error) {
    console.error("EMAIL FAILED");
    console.error(error);
}

}


const EmailVerificationContent = (username, verificationUrl) => {
    return {
        body: {
            name:username,
            intro: "welsome to our app ! we are excited to have u",
            action: {
                instructions: 'To verify ur email , please click button',
                button: {
                    color: '#13ca62',
                    text: 'verify ur mail',
                    link: verificationUrl,
                },
            },
            outro: "NEED HELP,or HAVE QUESTION?then contact the email we will help"
        },
    };
}

const ForgorPasswordVerificationContent = (username, passwordResetUrl) => {
    return {
        body: {
            name:username,
            intro: "u wnat to reset the pass word",
            action: {
                instructions: 'To reset the password , click the button',
                button: {
                    color: '#ca2b13',
                    text: 'password reset',
                    link: passwordResetUrl,
                },
            },
            outro: "if any problem then do with another way"
        },
    };
}

export {
    EmailVerificationContent, ForgorPasswordVerificationContent,sendEmail
}