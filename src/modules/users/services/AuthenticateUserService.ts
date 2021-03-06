import { getRepository } from 'typeorm';
import { compare } from 'bcryptjs';
import { sign } from 'jsonwebtoken'
import User from '@modules/users/infra/typeorm/entities/User';
import authConfig from '@config/auth';
import AppError from '@shared/errors/AppError';

interface Request {
  email: string;
  password: string;
}

interface Reponse {
  user: User;
  token: string;
}

class AthenticateUserService {
  public async execute({ email, password }: Request): Promise<Reponse> {
    const usersRepository = getRepository(User);

    const user = await usersRepository.findOne({ where: { email }});

    if (!user) {
      throw new AppError('Incorrect email/password combination.', 401);
    }

    const passwordMatched = await compare(password, user.password)

    if (!passwordMatched) {
      throw new AppError('Incorrect email/password combination.', 401);
    }

    const { secret, expiresIn } = authConfig.jwt;

    const token = sign({ }, secret, {
      subject: user.id,
      expiresIn
    });

    return {
      user,
      token,
    }
  }
}

export default AthenticateUserService;
