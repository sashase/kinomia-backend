export const combineDateWithTime = (date: string, time: string): Date => {
  const [year, month, day] = date.split('-')
  const [hours, minutes] = time.split(':')

  const combinedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hours), parseInt(minutes))
  return combinedDate
}