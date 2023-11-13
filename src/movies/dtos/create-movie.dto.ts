export class CreateMovieDto {
  id: number
  title: string
  title_ua: string
  overview: string
  backdrop_path: string
  poster_path: string
  rating?: number
}