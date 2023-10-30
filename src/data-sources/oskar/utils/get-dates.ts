export const getDates = (): string[] => {
  const today: Date = new Date()
  const daysUntilWednesday: number = (3 - today.getDay() + 7) % 7 // Calculate days until Wednesday

  const datesArray: string[] = []

  datesArray.push(formatDate(today))

  for (let i = 1; i <= daysUntilWednesday; i++) {
    const nextDate: Date = new Date(today)
    nextDate.setDate(today.getDate() + i)
    datesArray.push(formatDate(nextDate))
  }

  return datesArray
}

const formatDate = (date: Date): string => {
  const year: number = date.getFullYear()
  const month: string = String(date.getMonth() + 1).padStart(2, '0')
  const day: string = String(date.getDate()).padStart(2, '0')

  const formattedDate: string = `${year}-${month}-${day}`

  return formattedDate
}