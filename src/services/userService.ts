import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { connectDB } from './db';
import { User } from '../models/userModel';

const collectionName = 'users';

const signUp = async (fullName: string, email: string, password: string): Promise<void> => {
  try {
    const db = await connectDB();
    const usersCollection = db.collection<User>(collectionName);
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      throw new Error('User already exists');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await usersCollection.insertOne({ fullName, email, password: hashedPassword });
    console.log('User registered successfully!');
  } catch (error) {
    if (error instanceof Error) {
      console.error('Sign-up failed:', error.message);
    } else {
      console.error('Sign-up failed:', error);
    }
  }
};

const signIn = async (email: string, password: string): Promise<string> => {
  try {
    const db = await connectDB();
    const usersCollection = db.collection<User>(collectionName);
    const user = await usersCollection.findOne({ email });
    if (!user) {
      throw new Error('User not found');
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }
    return jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET as string, { expiresIn: '1h' });
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    } else {
      throw new Error('An unknown error occurred');
    }
  }
};

export { signUp, signIn };
