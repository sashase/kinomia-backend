import { SourceServiceResponse } from '../../../../interfaces'

export const resultStub = (): SourceServiceResponse => {
  return {
    code: 200,
    message: 'Oskar Data Successfully Updated',
  }
}