import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { UnprocessableEntityException, ValidationPipe } from "@nestjs/common";
import {
  DocumentBuilder,
  OpenAPIObject,
  SwaggerDocumentOptions,
  SwaggerCustomOptions,
  SwaggerModule,
} from "@nestjs/swagger";
import { ValidationError } from "class-validator";
import * as fs from "fs";
import * as path from "path";

const SWAGGER_NO_CACHE_PATHS = [
  "/docs",
  "/docs-json",
  "/vendor-docs",
  "/vendor-docs-json",
];

const createVendorDocument = (document: OpenAPIObject): OpenAPIObject => {
  const vendorPathPrefix = "/v1/integrations/vendor/";
  const vendorPaths = Object.entries(document.paths).reduce<OpenAPIObject["paths"]>(
    (acc, [route, routeConfig]) => {
      if (route.startsWith(vendorPathPrefix)) {
        acc[route] = routeConfig;
      }

      return acc;
    },
    {},
  );

  return {
    ...document,
    info: {
      ...document.info,
      title: "Siezal Vendor API Docs",
      description: "Vendor integration endpoints only",
    },
    tags: (document.tags || []).filter((tag) => tag.name === "Vendor integrations"),
    paths: vendorPaths,
  };
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS (Cross-Origin Resource Sharing)
  app.enableCors({
    origin: "*", // Change this to restrict the origins
  });

  app.use((req, res, next) => {
    const path = req.path || req.url || "";

    if (SWAGGER_NO_CACHE_PATHS.some((swaggerPath) => path === swaggerPath || path.startsWith(`${swaggerPath}/`))) {
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
    }

    next();
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
    const document = SwaggerModule.createDocument(app, config, options);
    const vendorDocument = createVendorDocument(document);
    const vendorSwaggerOptions: SwaggerCustomOptions = {
      jsonDocumentUrl: "vendor-docs-json",
    };

    // Setup Swagger Module
    SwaggerModule.setup("docs", app, document);
    SwaggerModule.setup("vendor-docs", app, vendorDocument, vendorSwaggerOptions);
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
