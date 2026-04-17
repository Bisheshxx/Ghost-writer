export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
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
