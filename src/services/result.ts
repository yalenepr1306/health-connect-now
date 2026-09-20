export interface ServiceResult<T> {
  data: T | null;
  error: string | null;
}

export function ok<T>(data: T): ServiceResult<T> {
  return { data, error: null };
}

export function fail<T = null>(error: string): ServiceResult<T> {
  return { data: null, error };
}
