import { getUTCDateFromLocal } from '../../utils'

export const combineDateWithTime = (dayTimestamp: string, time: string): Date => {
  const timestamp: number = parseInt(dayTimestamp, 10)

  const [hour, minute]: number[] = time.split(':').map(Number)
  const day: Date = new Date(timestamp * 1000)

  const combinedDate: Date = new Date(day.getFullYear(), day.getMonth(), day.getDate(), hour, minute)

  const combinedDateUTC: Date = getUTCDateFromLocal(combinedDate)

  return combinedDateUTC
}