import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

let configuredConnectionString: string | undefined;

export function configureDb(connectionString: string) {
  configuredConnectionString = connectionString;
}

function createDb() {
  if (configuredConnectionString) {
    return new PrismaClient({
      adapter: new PrismaPg({ connectionString: configuredConnectionString }),
    });
  }

  return new PrismaClient();
}

export const db = new Proxy({} as PrismaClient, {
  get(_target, property, receiver) {
    // Hyperdrive owns the durable connection pool in Workers. Do not retain a
    // Prisma client between Worker invocations because it can hold a stale
    // edge connection while Hyperdrive has already recycled its origin pool.
    const client = configuredConnectionString
      ? createDb()
      : (globalForPrisma.prisma ?? (globalForPrisma.prisma = createDb()));
    const value = Reflect.get(client, property, receiver);
    return typeof value === "function" ? value.bind(client) : value;
  },
});

export * from "@prisma/client";
