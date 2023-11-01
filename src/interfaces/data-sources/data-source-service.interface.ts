export interface DataSourceService {
  updateData(): Promise<{ message: string, code: number }>
}