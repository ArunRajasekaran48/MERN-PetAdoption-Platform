import sgmail from '@sendgrid/mail'
import { ApiError } from './ApiError.js'
import dotenv from "dotenv"
dotenv.config();
sgmail.setApiKey(process.env.SENDGRID_API_KEY)

const sendEmail=async (to,subject,text,html)=>{
    try {
        const msg = {
            to,
            from: {
                name: 'Pet-adoption',
                email: process.env.SENDER_MAIL 
            },
            subject,
            text,
            html
        };
        await sgmail.send(msg)
        console.log('Email Sent Successfully!');
        
    }  catch (error) {
        console.error('Error sending email:', error.response ? error.response.body : error);
        throw new ApiError(400,'Failed to send email')
    }
}

export {sendEmail}