export const combineDateWithTime = (dayTimestamp: string, time: string): Date => {
  const timestamp = parseInt(dayTimestamp, 10)

  const [hour, minute] = time.split(':').map(Number)

  const day = new Date(timestamp * 1000)
  const combinedDate = new Date(day.getFullYear(), day.getMonth(), day.getDate(), hour, minute)
  return combinedDate
}