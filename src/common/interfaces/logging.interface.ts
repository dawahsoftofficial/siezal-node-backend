export interface IRequestInfo {
    method: string;
    url: string;
    headers: any;
    body: any;
    query: any;
    requestId: string;
    timestamp: string;
    isMultipart?: boolean;
    files?: any[];
  }

    
  export interface ILogData {
    requestInfo: IRequestInfo;
    statusCode: number;
    duration: string;
    responseBody: any;
    sqlQueries: any[];
    errorMessage?: string;
    exception?: string;
  }
  