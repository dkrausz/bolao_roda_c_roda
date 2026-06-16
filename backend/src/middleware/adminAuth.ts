import { Request, Response, NextFunction } from 'express';

export function adminAuth(req: Request, res: Response, next: NextFunction): void {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Basic ')) {
    res.status(401).json({ error: 'Credenciais de admin obrigatórias' });
    return;
  }

  const decoded = Buffer.from(auth.replace('Basic ', ''), 'base64').toString('utf-8');
  const [user, pass] = decoded.split(':');

  if (user === process.env.ADMIN_USER && pass === process.env.ADMIN_PASS) {
    next();
    return;
  }

  res.status(401).json({ error: 'Credenciais inválidas' });
}
