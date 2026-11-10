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
    const client = globalForPrisma.prisma ?? (globalForPrisma.prisma = createDb());
    const value = Reflect.get(client, property, receiver);
    return typeof value === "function" ? value.bind(client) : value;
  },
});

export * from "@prisma/client";
