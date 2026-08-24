export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ApiFieldError {
  field?: string;
  message: string;
}

export interface ApiErrorBody {
  success: false;
  message: string;
  errors: ApiFieldError[];
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}
