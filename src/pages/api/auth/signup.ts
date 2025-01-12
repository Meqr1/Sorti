import { NextApiRequest, NextApiResponse } from 'next';
import { SignupFormSchema } from "@/lib/definations";
import { prisma } from "@/lib/prisma";
import instance from "@/lib/axios";
import { hash } from 'bcrypt';

export default async function signup(req: NextApiRequest, res: NextApiResponse) {
  console.log('Signup API called'); // Log entry point

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const formData = req.body;
  console.log('Received formData:', formData); // Log the incoming form data

  // Validate form data
  const validateResults = SignupFormSchema.safeParse({
    name: formData.name,
    email: formData.email,
    password: formData.password,
  });

  if (!validateResults.success) {
    console.log('Validation failed');
    return res.status(400).json({
      errors: validateResults.error.flatten().fieldErrors,
    });
  }

  const { name, email, password } = validateResults.data;

  try {
    // Check if the rankId 1 exists in the Rank table
    const rankExists = await prisma.rank.findUnique({
      where: { id: 1 }, // rankId should be 1
    });

    if (!rankExists) {
      console.log('RankId 1 does not exist');
      return res.status(400).json({ error: 'Invalid rankId.' });
    }

    // Check if the email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log('Email already in use');
      return res.status(400).json({ error: 'Email already in use.' });
    }

    // Hash the password before saving to the database
    const hashedPassword = await hash(password, 10);

    // Create the user in the database
    const user = await prisma.user.create({
      data: {
        email: email,
        password: hashedPassword,
        uname: name,
        rankId: 1, // Ensure this rankId exists
        xp: 0, // Initial XP
      },
      select: {
        id: true, // Only returning the user ID for simplicity
      },
    });

    console.log('User created:', user);

    // Optionally create a session for the user
    await instance.post('/api/auth/createSession', {
      id: user.id,
    });

    // Send success response
    return res.status(201).json({
      success: true,
      userId: user.id,
    });
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ error: 'An error occurred during signup' });
  }
}

