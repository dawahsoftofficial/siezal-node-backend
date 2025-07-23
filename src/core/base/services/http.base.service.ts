// base-http.service.ts
import { HttpService } from '@nestjs/axios';
import {
  HttpException,
  Injectable,
} from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { AxiosRequestConfig, AxiosResponse } from 'axios';

@Injectable()
export abstract class BaseHttpService {
  /**
   * Constructor for BaseHttpService
   * @param httpService - The NestJS Axios HTTP service instance
   * @param baseUrl - The base URL for all HTTP requests
   * @param defaultHeaders - Default headers to include in every request
   */
  protected constructor(
    protected readonly httpService: HttpService,
    protected readonly baseUrl: string,
    protected readonly defaultHeaders: Record<string, string> = {},
  ) {}

  /**
   * Core request method that handles all HTTP requests
   * @param config - Axios request configuration
   * @returns Promise with AxiosResponse
   */
  protected async request<T>(
    config: AxiosRequestConfig,
  ): Promise<AxiosResponse<T> | undefined> {
    // Combine base URL with endpoint URL
    const fullUrl = `${this.baseUrl}${config.url || ''}`;

    // Prepare final request configuration
    const requestConfig: AxiosRequestConfig = {
      ...config, // Spread existing config
      url: fullUrl, // Use combined URL
      headers: {
        ...this.defaultHeaders, // Include default headers
        ...config.headers, // Merge with request-specific headers
      },
    };

    try {
      // Execute the request and convert Observable to Promise
      const response = await firstValueFrom(
        this.httpService.request(requestConfig),
      );

      // Check for API-level errors in response
      if (response?.data?.error) {
        this.handleApiError(response?.data?.data);
      }

      return response;
    } catch (error) {
      // Handle any request errors
      this.handleApiError(error);
    }
  }

  /**
   * Simple GET request method
   * @param url - The endpoint URL (appended to baseUrl)
   * @param config - Optional Axios request configuration
   * @returns Promise with AxiosResponse
   */
  protected async get<T>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T> | undefined> {
    return await this.request<T>({
      ...config, // Spread existing config
      url, // Set the endpoint URL
      method: 'GET', // Set HTTP method
    });
  }

  /**
   * Simple POST request method
   * @param url - The endpoint URL (appended to baseUrl)
   * @param data - The request payload
   * @param config - Optional Axios request configuration
   * @returns Promise with AxiosResponse
   */
  protected async post<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T> | undefined> {
    return this.request<T>({
      ...config, // Spread existing config
      url, // Set the endpoint URL
      method: 'POST', // Set HTTP method
      data, // Include request payload
    });
  }

  /**
   * Abstract error handler - must be implemented by child classes
   * @param error - The error to handle
   * @throws Never returns, always throws an exception
   */
  protected abstract handleError(error: any): never;

  /**
   * Handles API errors with specific error codes
   * @param error - The error object from API response
   * @throws HttpException with appropriate status code and message
   */
  protected handleApiError(error: any) {
    const statusCode = !isNaN(error?.code)
      ? error.code
      : !isNaN(error?.status)
        ? error.status
        : 500;
    console.log('statusCode', statusCode);
    const message = error.message || 'An error occurred with a specific code';
    throw new HttpException(message, statusCode);
  }
}
