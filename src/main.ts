import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { UnprocessableEntityException, ValidationPipe } from "@nestjs/common";
import {
  DocumentBuilder,
  SwaggerDocumentOptions,
  SwaggerModule,
} from "@nestjs/swagger";
import { ValidationError } from "class-validator";
import * as fs from "fs";
import * as path from "path";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS (Cross-Origin Resource Sharing)
  app.enableCors({
    origin: "*", // Change this to restrict the origins
  });

  if (process.env.NODE_ENV !== "prod") {
    // Swagger Configuration
    const config = new DocumentBuilder()
      .setTitle("Siezal API Docs")
      .setDescription("The Siezal API description")
      .setVersion("1.0")
      .addServer(process.env.BASE_URL!, process.env.NODE_ENV)
      .addBasicAuth({ type: "http", scheme: "basic" }, "basicAuth")
      .addBearerAuth({ type: "http", scheme: "bearer" }, "bearerAuth")
      .addApiKey({ type: "apiKey", scheme: "apiKey" }, "payload")
      .build();
    const options: SwaggerDocumentOptions = {
      operationIdFactory: (controllerKey: string, methodKey: string) =>
        methodKey,
    };
    const documentFactory = () =>
      SwaggerModule.createDocument(app, config, options);

    // Setup Swagger Module
    SwaggerModule.setup("docs", app, documentFactory());
  }

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      stopAtFirstError: true,
      transformOptions: {
        enableImplicitConversion: true, // Allow implicit conversion for params/query
      },
      exceptionFactory: (errors: ValidationError[]) => {
        // Format validation errors
        const formattedErrors = formatValidationErrors(errors);

        return new UnprocessableEntityException({
          success: false,
          message: "Validation failed for the input data.",
          errors: formattedErrors,
        });
      },
    })
  );
  function formatValidationErrors(
    errors: ValidationError[],
    parentPath = ""
  ): Record<string, string[]> {
    return errors.reduce((acc, error) => {
      const propertyPath = parentPath
        ? `${parentPath}.${error.property}`
        : error.property;

      // Handle nested validation errors
      if (error.children && error.children.length > 0) {
        const nestedErrors = formatValidationErrors(
          error.children,
          propertyPath
        );
        Object.assign(acc, nestedErrors);
      }

      // Handle constraints (validation messages)
      if (error.constraints) {
        acc[propertyPath] = Object.values(error.constraints);
      }

      return acc;
    }, {});
  }
  await app.listen(process.env.PORT || 3000);
}

bootstrap();
