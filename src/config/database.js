// Singleton do Prisma Client: uma única instância (e pool de conexões) para a
// aplicação inteira. O banco vem de DATABASE_URL (.env).
// Só a camada de repository importa este módulo.
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();
