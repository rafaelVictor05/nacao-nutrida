const config = {
  schema: "./prisma/schema.prisma",
  migrate: {
    url: process.env.DATABASE_URL,
  },
};

export default config;
