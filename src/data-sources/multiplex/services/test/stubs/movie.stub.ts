import { HTMLElement, parse } from 'node-html-parser'

export const movieStub = (): HTMLElement => {
  const html: string = `
            <div data-href="/movie/355542" class="mp_poster" style="width: 350px;">
                <p class="closing_tag">
                    До кінця<br>прокату 4
                      дні!
                </p>
                <div class="bg" style="background-image: -moz-linear-gradient(top, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 70%, rgba(0,0,0,1) 100%), url('/images/71/df/71df29e857896f76ed673ddb87122ca6.jpeg'); background-image: -webkit-linear-gradient(top, rgba(0,0,0,0) 0%,rgba(0,0,0,0) 70%,rgba(0,0,0,1) 100%), url('/images/71/df/71df29e857896f76ed673ddb87122ca6.jpeg'); background-image: linear-gradient(to bottom,  rgba(0,0,0,0) 0%,rgba(0,0,0,0) 54%,rgba(0,0,0,1) 100%), url('/images/71/df/71df29e857896f76ed673ddb87122ca6.jpeg')"></div>
              <div class="mpp_mask animated fadeIn">
                <div class="toplinks">
                  <a title="ШТТЛ" href="/movie/355542" class="mpp_tomoviepage" onclick="dataLayer.push({'event':'custom_event','event_category':'button','event_action':'read_more_on_main','event_label':''})"><i></i><span>Детальніше<br>про фільм</span></a>
                    <a href="javascript:;" data-name="ШТТЛ" data-moviehref="/movie/355542" data-trailerid="0Ue45PYGrHo" class="mpp_trailer trailerbut" data-type="Трейлер"><i></i><span>Дивитись<br>Трейлер</span></a>
                </div>
                <p class="current_cinema">Lavina IMAX Лазер</p>
              <p class="current_date">
                <span onclick="dataLayer.push({'event':'custom_event','event_category':'button','event_action':'click_today_on_main','event_label':''})" class="">Завтра</span>
              </p>
                  <p class="closest" style="display: block;">Найближчий сеанс</p>
                  <div class="closest_session" style="display: block;">
                    <p class="closest_time"><span class="time">18:20</span><br><span class="format"></span></p>
                    <div class="buy_closest ns" onclick="dataLayer.push({'event':'custom_event','event_category':'button','event_action':'buy_ticket_on_main','event_label':''});" data-id="0000000017-224013" data-name="ШТТЛ" data-moviehref="/movie/355542" data-low="19000" data-high="29000">Купити квиток<span class="price_min_max">від 190 грн</span></div>
                  </div>
                <p class="sch_heading" style="display: block;">Розклад сеансів</p>
                  <div class="mpp_schedule" data-page="0" data-selector="1698537600" style="display: block;">
                        <div class="ns " onclick="dataLayer.push({'event':'custom_event','event_category':'button','event_action':'click_on_session_on_main','event_label':''});" data-id="0000000017-224013" data-name="ШТТЛ" data-moviehref="/movie/355542" data-low="19000" data-high="29000">
                          <p class="time"><span>18:20</span></p>
                          <p class="tag"></p>
                        </div>
                  </div>
                  <div class="mpp_schedule" data-page="0" data-selector="1698624000" style="display:none;">
                        <div class="ns " onclick="dataLayer.push({'event':'custom_event','event_category':'button','event_action':'click_on_session_on_main','event_label':''});" data-id="0000000017-224069" data-name="ШТТЛ" data-moviehref="/movie/355542" data-low="17000" data-high="27000">
                          <p class="time"><span>18:20</span></p>
                          <p class="tag"></p>
                        </div>
                  </div>
                  <div class="mpp_schedule" data-page="0" data-selector="1698710400" style="display:none;">
                        <div class="ns " onclick="dataLayer.push({'event':'custom_event','event_category':'button','event_action':'click_on_session_on_main','event_label':''});" data-id="0000000017-224090" data-name="ШТТЛ" data-moviehref="/movie/355542" data-low="17000" data-high="27000">
                          <p class="time"><span>18:20</span></p>
                          <p class="tag"></p>
                        </div>
                  </div>
                  <div class="mpp_schedule" data-page="0" data-selector="1698796800" style="display: none;">
                        <div class="ns " onclick="dataLayer.push({'event':'custom_event','event_category':'button','event_action':'click_on_session_on_main','event_label':''});" data-id="0000000017-224146" data-name="ШТТЛ" data-moviehref="/movie/355542" data-low="17000" data-high="27000">
                          <p class="time"><span>18:20</span></p>
                          <p class="tag"></p>
                        </div>
                  </div>
                    <div class="soldout_info">
                      <img src="/img/soldout_ua.png" alt="На жаль, сеансів на сьогодні більше немає" title="На жаль, сеансів на сьогодні більше немає">
                      <p>
                        На жаль, сеансів<br>
                        на сьогодні більше немає<br>
                        <br>
                        Найближчі сеанси<br>
                        <span>Завтра</span>
                      </p>
                    </div>
              </div>
              <div class="date_selector" style="display: none;">
                <ul>
                  <li class="current" data-selector="1698537600">
                    <p class="smartdayname">Завтра</p>
                    <p class="smartdaydets">Нд, 29 жовтня</p>
                  </li>
                  <li data-selector="1698624000">
                    <p class="smartdayname">Пн, 30 жовтня</p>
                  </li>
                  <li data-selector="1698710400">
                    <p class="smartdayname">Вт, 31 жовтня</p>
                  </li>
                    <li data-selector="1698796800" class="">
                      <p class="smartdayname">Ср, 1 листопада</p>
                      <p class="smartdaydets last_date">Останній день показу фільму!</p>
                    </li>
                </ul>
              </div>
              <a title="ШТТЛ" href="/movie/355542" class="mpp_title"><span>ШТТЛ</span></a>
            </div>
  `
  const root = parse(html)
  const movie: HTMLElement = root.querySelector('.mp_poster')
  return movie
}

