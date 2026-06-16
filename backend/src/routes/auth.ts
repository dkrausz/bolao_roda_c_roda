import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';

const router = Router();

router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const { phone, password } = req.body as { phone?: string; password?: string };

  if (!phone || !password) {
    res.status(400).json({ error: 'Telefone e senha são obrigatórios' });
    return;
  }

  const user = await prisma.user.findUnique({ where: { phone } });

  if (!user || !(await bcrypt.compare(String(password), user.passwordHash))) {
    res.status(401).json({ error: 'Telefone ou senha incorretos' });
    return;
  }

  const token = jwt.sign(
    { id: user.id, name: user.name, phone: user.phone },
    process.env.JWT_SECRET as string,
    { expiresIn: '30d' }
  );

  res.json({ token, user: { id: user.id, name: user.name } });
});

export default router;
