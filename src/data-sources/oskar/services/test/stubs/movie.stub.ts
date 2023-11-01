import { HTMLElement, parse } from 'node-html-parser'

export const movieStub = (): HTMLElement => {
  const html: string = `
            <div class="filter-result__item">
              <div class="filter-result__visual">
                <div
                  class="filter-result__bg"
                  style="background-image: url(/storage/movies/API/10231.jpg)"></div>
                <span class="gallery__visual_age" style="background-color: #000000"
                  >16+</span
                >
                <div class="gallery__visual_content click-info">
                  <div class="gallery__visual_btn-row">
                    <a
                      class="gallery__visual_play fancybox.iframe"
                      data-fancybox
                      href="https://youtu.be/-4-uqOy0BhE">
                      <svg class="icon icon_play">
                        <use xlink:href="/images/icons.svg#icon_play"></use>
                      </svg>
                    </a>
                    <a class="gallery__visual_info" href="/movie/mizh-nami">
                      <svg class="icon icon_info">
                        <use xlink:href="/images/icons.svg#icon_info"></use>
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
              <div class="filter-result__holder">
                <div class="filter-result__name">
                  <span class="gallery__visual_age" style="background-color: #000000"
                    >16+</span
                  >
                  <div class="name"><a href="/movie/mizh-nami">Між нами</a></div>
                </div>
                <div class="filter-result__time-wrap">
                  <a
                    class="filter-result__time"
                    href="/order?cinemaId=gulliver&sessionId=111200"
                    target="_blank">
                    <span class="">12:10</span>
                    <span class="filter-result__time-bullet" data-sesattr="5">
                      <span class="bullet-description" style="background-color: #339966"
                        >2D</span
                      >
                    </span>
                  </a>
                  <a
                    class="filter-result__time"
                    href="/order?cinemaId=gulliver&sessionId=111116"
                    target="_blank">
                    <span class="time">20:00</span>
                    <span class="filter-result__time-bullet" data-sesattr="5">
                      <span class="bullet-description" style="background-color: #339966"
                        >2D</span
                      >
                    </span>
                  </a>
                </div>
              </div>
          </div>
  `
  const root = parse(html)
  const movie: HTMLElement = root.querySelector('div.filter-result__item')
  return movie
}

