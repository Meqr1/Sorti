'use server'
import nodemailer from 'nodemailer';
import bcrypt from 'bcrypt'
import { FormState, SignupFormSchema } from "./definations"
import { encrypt } from '../_lib/mail';
import { headers } from 'next/headers';

export async function signup(_state: FormState, formData: FormData) {
  const validationResult = SignupFormSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password')
  })

  if (!validationResult.success) {
    return {
      errors: validationResult.error.flatten().fieldErrors,
    };
  }

  const { name, email, password } = validationResult.data

  const hashedPassword = await bcrypt.hash(password, 10)

  const encryptedData = encodeURIComponent(await encrypt({ email, name, password: hashedPassword }))

  const headersList = await headers()
  const domain = headersList.get('x-forwarded-host') || "";
  const protocol = headersList.get("x-forwarded-proto") || "";

  const verificationUrl = `${protocol}://${domain}/api/verify/${encryptedData}`;

  await sendEmail(email, 'Verify Your Email', `
                  Please verify your account: <a href="${verificationUrl}">${protocol}://${domain}/api/verify</>
                  `);

  return { success: true, message: 'Verification email sent. Please check your inbox.' };
}

export async function sendEmail(to: string, subject: string, html: string) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'ayanmahajan41@gmail.com',
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: 'sorti.no.reply@gmail.com',
    to,
    subject,
    html,
  };

  await transporter.sendMail(mailOptions);
}

