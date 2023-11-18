import { SourceServiceResponse } from '../../../../../data-sources/interfaces'

export const resultStub = (): SourceServiceResponse => {
  return {
    code: 200,
    message: 'Multiplex Data Successfully Updated',
  }
}