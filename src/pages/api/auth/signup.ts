import { NextApiRequest, NextApiResponse } from 'next';
import { SignupFormSchema } from "@/lib/definations";
import { prisma } from "@/lib/prisma";
import instance from "@/lib/axios";
import { hash } from 'bcrypt';

export default async function signup(req: NextApiRequest, res: NextApiResponse) {

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const formData = req.body;

  const validateResults = SignupFormSchema.safeParse({
    name: formData.name,
    email: formData.email,
    password: formData.password,
  });

  if (!validateResults.success) {
    return res.status(400).json({
      errors: validateResults.error.flatten().fieldErrors,
    });
  }

  const { name, email, password } = validateResults.data;

  try {
    const rankExists = await prisma.rank.findUnique({
      where: { id: 1 },
    });

    if (!rankExists) {
      return res.status(400).json({ error: 'Invalid rankId.' });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use.' });
    }

    const hashedPassword = await hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email: email,
        password: hashedPassword,
        uname: name,
        rankId: 1,
        xp: 0,
      },
      select: {
        id: true,
      },
    });

    const response = await instance.post('/api/auth/createSession', {
      id: user.id,
    });

    if (response.status === 200 && response.data.cookie !== null) {
      const cookie = response.data.cookie
      res.setHeader(
        "Set-Cookie",
        `${cookie.name}=${cookie.session}; Path=${cookie.path}; Expires=${cookie.expires}; HttpOnly; Secure=${cookie.secure ? "True" : "False"}; SameSite=${cookie.sameSite}`
      );
    }

    return res.status(201).json({
      success: true,
      userId: user.id,
    });

  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ error: 'An error occurred during signup' });
  }
}

