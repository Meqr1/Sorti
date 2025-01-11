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

  console.log(formData)

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
    const hashedpassword = await hash(password, 10)

    const user = await prisma.user.create({
      data: {
        email: email,
        password: hashedpassword,
        uname: name,
        rankId: 1,
        xp: 0,
      },
      select: {
        id: true,
      },
    });

    // Create session by posting to session creation API
    await instance.post('/api/auth/createSession', {
      id: user.id,
    });

    // Send a success response back to the client
    return res.status(201).json({
      success: true,
      userId: user.id,
    });
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ error: 'An error occurred during signup' });
  }
}

