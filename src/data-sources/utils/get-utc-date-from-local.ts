import { DateTime } from 'luxon'
import { SHOWTIMES_TIMEZONE_ISO_NAME } from '../constants'

export const getUTCDateFromLocal = (localDate: Date): Date => {
  const localIsoString: string = localDate.toISOString().slice(0, -1) // Slicing last z character to set a custom timezone

  const UTCDate: Date = DateTime.fromISO(localIsoString, { zone: SHOWTIMES_TIMEZONE_ISO_NAME }).toJSDate()

  return UTCDate
}
