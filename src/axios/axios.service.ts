import { Injectable } from '@nestjs/common'
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'

@Injectable()
export class AxiosService {
  async get(url: string, config?: AxiosRequestConfig<any>): Promise<AxiosResponse> {
    return await axios
      .get(url, config)
      .then((response) => Promise.resolve(response))
      .catch((error) => Promise.reject(error))
  }

  async post(url: string, data: any, config?: AxiosRequestConfig<any>): Promise<AxiosResponse> {
    return await axios
      .post(url, data, config)
      .then((response) => Promise.resolve(response))
      .catch((error) => Promise.reject(error))
  }
}
