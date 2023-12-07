import { getUTCDateFromLocal } from '../../utils'

export const combineDateWithTime = (date: string, time: string): Date => {
  const [year, month, day]: number[] = date.split('-').map(Number)
  const [hours, minutes]: number[] = time.split(':').map(Number)

  const combinedDate: Date = new Date(year, month - 1, day, hours, minutes)

  const combinedDateUTC: Date = getUTCDateFromLocal(combinedDate)

  return combinedDateUTC
}