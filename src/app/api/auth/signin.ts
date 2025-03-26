import type { NextApiRequest, NextApiResponse } from 'next';
import { signIn } from '@/services/userService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { email, password } = req.body;

  try {
    const token = await signIn(email, password);
    return res.status(200).json({ message: 'Sign-in successful', token });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
}
