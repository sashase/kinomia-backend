import { SourceServiceResponse } from './source-service-response.interface'

export interface DataSourceService {
  updateData(): Promise<SourceServiceResponse>
}