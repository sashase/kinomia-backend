export const getOrderLink = (id: string): string => {
  const [cinemaId, showtimeId] = id.split('-')
  const orderLink = `https://new.multiplex.ua/order/cinema/${cinemaId}/session/${showtimeId}`
  return orderLink
}