// logging.interceptor.ts
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from "@nestjs/common";
import { Observable, catchError, tap } from "rxjs";
import { Request, Response } from "express";
import { QueryLogger } from "src/core/loggers/query.logger";
import { ILogData, IRequestInfo } from "../interfaces/logging.interface";
import { filterSensitiveData } from "../utils/app.util";
import { ELogType } from "../enums/app.enum";
import { AuditLogService } from "src/module/audit-log/audit-log.service";

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);
  private readonly HEALTH_CHECK_PATH = "/health-check";
  private readonly MAX_BODY_LOG_SIZE = 1024 * 10; // 10KB
  private readonly MAX_FILE_LOG_SIZE = 1024 * 5; // 5KB
  private readonly SENSITIVE_FIELDS = [
    "accessToken",
    "refreshToken",

    "payload",
    "password",
  ];

  constructor(private readonly auditLogService: AuditLogService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>() as any;
    const response = context.switchToHttp().getResponse<Response>();

    const requestId = request.headers["x-request-id"] || `req_${Date.now()}`;
    const queryLogger = this.initializeQueryLogger(requestId, request);
    const startTime = Date.now();
    const isMultipart = this.isMultipartRequest(request);
    const requestInfo = this.extractRequestInfo(
      request,
      requestId,
      isMultipart
    );

    return next.handle().pipe(
      tap((data) =>
        this.handleSuccess(data, requestInfo, response, startTime, queryLogger)
      ),
      catchError((error) =>
        this.handleError(error, requestInfo, startTime, queryLogger)
      )
    );
  }

  private isMultipartRequest(request: Request): boolean {
    const contentType = request.headers["content-type"];
    return contentType && contentType.includes("multipart/form-data")
      ? true
      : false;
  }

  private initializeQueryLogger(requestId: string, request: any): QueryLogger {
    const queryLogger = new QueryLogger(requestId);
    QueryLogger.current = queryLogger;
    request.queryLogger = queryLogger;
    return queryLogger;
  }

  private extractRequestInfo(
    request: Request,
    requestId: string,
    isMultipart: boolean
  ): IRequestInfo {
    const requestInfo: IRequestInfo = {
      method: request.method,
      url: request.url,
      headers: this.sanitizeHeaders(request.headers),
      body: this.sanitizeData(request.body),
      query: this.sanitizeData(request.query),
      requestId,
      timestamp: new Date().toISOString(),
      isMultipart,
    };

    if (isMultipart) {
      requestInfo.files = this.extractFileInfo(request);
      requestInfo.body = this.sanitizeData(request.body);
    }

    return requestInfo;
  }

  private sanitizeHeaders(headers: any): any {
    const result = this.sanitizeData(headers);
    // Remove sensitive headers

    if (result.cookie) {
      result.cookie = result.cookie
        .split(";")
        .map((cookie: string) => {
          const [name] = cookie.split("=");
          return this.SENSITIVE_FIELDS.some((field) =>
            name.trim().toLowerCase().includes(field)
          )
            ? `${name.trim()}=*****`
            : cookie;
        })
        .join(";");
    }
    return result;
  }

  private extractFileInfo(request: any): any[] {
    if (!request.files) return [];

    return Object.entries(request.files)
      .map(([fieldName, files]) => {
        const fileArray = Array.isArray(files) ? files : [files];
        return fileArray.map((file) => ({
          fieldName,
          originalname: file.originalname,
          encoding: file.encoding,
          mimetype: file.mimetype,
          size: file.size,
          truncated: file.size > this.MAX_FILE_LOG_SIZE,
          buffer:
            file.size <= this.MAX_FILE_LOG_SIZE
              ? file.buffer?.toString("base64")?.substring(0, 100) + "..."
              : undefined,
        }));
      })
      .flat();
  }
  private handleSuccess(
    data: any,
    requestInfo: IRequestInfo,
    response: Response,
    startTime: number,
    queryLogger: QueryLogger
  ): void {
    this.logRequest(
      requestInfo,
      response.statusCode,
      data,
      startTime,
      "success",
      queryLogger
    );
    this.cleanupQueryLogger(queryLogger);
  }

  private handleError(
    error: any,
    requestInfo: IRequestInfo,
    startTime: number,
    queryLogger: QueryLogger
  ): never {
    this.logRequest(
      requestInfo,
      error.status || 500,
      error,
      startTime,
      "error",
      queryLogger
    );
    this.cleanupQueryLogger(queryLogger);
    throw error;
  }

  private cleanupQueryLogger(queryLogger: QueryLogger): void {
    QueryLogger.current = undefined;
    queryLogger.logs.length = 0;
  }

  private async logRequest(
    requestInfo: IRequestInfo,
    statusCode: number,
    response: any,
    startTime: number,
    status: "success" | "error",
    queryLogger: QueryLogger
  ): Promise<void> {
    const duration = `${Date.now() - startTime}ms`;
    const logType = ELogType.API_REQUEST;
    const logMessage = this.getLogMessage(status, requestInfo);
    const logData = this.buildLogData(
      requestInfo,
      statusCode,
      response,
      duration,
      status,
      queryLogger
    );

    if (requestInfo.url !== this.HEALTH_CHECK_PATH && status !== "success") {
      this.sendToAuditLog(logMessage, logData, logType, status);
    }

    this.logRequestSummary(status, requestInfo, duration);
  }

  private getLogMessage(
    status: "success" | "error",
    requestInfo: IRequestInfo
  ): string {
    return `API ${status.toUpperCase()} - ${requestInfo.method} ${requestInfo.url}`;
  }

  private buildLogData(
    requestInfo: IRequestInfo,
    statusCode: number,
    response: any,
    duration: string,
    status: "success" | "error",
    queryLogger: QueryLogger
  ): ILogData {
    const { options, ...rest } = response || {}; // Default to an empty object if response is undefined
    const errorMessage =
      status === "error"
        ? `${response.message} ${response?.options?.sqlMessage || ""}`.trim()
        : undefined;

    return {
      requestInfo,
      statusCode,
      duration,
      responseBody: this.sanitizeData(rest),
      sqlQueries: [...queryLogger.logs],
      errorMessage,
      exception: status === "error" ? JSON.stringify(response) : undefined,
    };
  }

  private sendToAuditLog(
    message: string,
    data: ILogData,
    type: ELogType,
    status: "success" | "error"
  ): void {
    if (status === "success") {
      this.auditLogService.log(message, data, type);
    } else {
      this.auditLogService.error(message, data, type);
    }
  }

  private logRequestSummary(
    status: "success" | "error",
    requestInfo: IRequestInfo,
    duration: string
  ): void {
    const statusEmoji = status === "success" ? "✅" : "❌";
    this.logger[status === "success" ? "log" : "error"](
      `${statusEmoji} API ${status.toUpperCase()}: ${requestInfo.method} ${
        requestInfo.url
      } - ${duration}`
    );
  }

  private sanitizeData(data: any): any {
    return data;

    return filterSensitiveData(data, this.SENSITIVE_FIELDS);
  }
}
