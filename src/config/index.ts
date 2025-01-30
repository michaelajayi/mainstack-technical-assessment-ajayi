import joi from "joi";

const envVarsSchema = joi
  .object({
    NODE_ENV: joi.string().default("development"),
    MONGO_URI: joi.string().required().description("MONGO_URI is required"),
    JWT_SECRET: joi.string().required().description("JWT_SECRET is required"),
    PORT: joi.number().default(8000),
  })
  .unknown()
  .required();

const { value: envVars, error } = envVarsSchema.validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const config = {
  env: {
    isProduction: process.env.NODE_ENV === "production",
    isDevelopment: process.env.NODE_ENV === "development",
    isTest: process.env.NODE_ENV === "test",
  },
  mongo: {
    uri: envVars.MONGO_URI,
  },
  jwt: {
    secret: envVars.JWT_SECRET,
  },
  port: {
    app: envVars.PORT,
  },
};

export default config;