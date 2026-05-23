export interface ApiResponse<T = any, M = any> {
  success: boolean;
  data?: T;
  meta?: M;
  error?: {
    message: string;
    code?: string;
    validationErrors?: Array<{
      field: {
        index: number | null;
        name: string;
      };
      message: string;
      code: string;
    }>;
  };
  timestamp: string;
}
