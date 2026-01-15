import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { RegisterInput, LoginInput } from '../validators/auth.validator';

export class AuthService {
    private generateToken(userId: string, email: string): string {
        const jwtSecret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
        const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

        return jwt.sign({ userId, email }, jwtSecret, { expiresIn: '7d' });
    }

    async register(data: RegisterInput) {
        // Check if user already exists
        const existingUser = await User.findOne({ email: data.email });
        if (existingUser) {
            throw new Error('Email already registered');
        }

        // Create new user
        const user = new User({
            email: data.email,
            password: data.password,
            name: data.name,
        });

        await user.save();

        // Generate token
        const token = this.generateToken(user._id.toString(), user.email);

        return {
            token,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
            },
        };
    }

    async login(data: LoginInput) {
        const user = await User.findOne({ email: data.email });
        if (!user) {
            throw new Error('Invalid credentials');
        }

        const isPasswordValid = await user.comparePassword(data.password);
        if (!isPasswordValid) {
            throw new Error('Invalid credentials');
        }

        const token = this.generateToken(user._id.toString(), user.email);

        return {
            token,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
            },
        };
    }
}

export const authService = new AuthService();
