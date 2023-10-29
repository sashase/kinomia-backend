import { HTMLElement, parse } from 'node-html-parser'

export const filteredShowtimesStub = (): HTMLElement[] => {
  const html: string = `
                        <div class="ns " onclick="dataLayer.push({'event':'custom_event','event_category':'button','event_action':'click_on_session_on_main','event_label':''});" data-id="0000000017-224146" data-name="ШТТЛ" data-moviehref="/movie/355542" data-low="17000" data-high="27000">
                          <p class="time"><span>16:20</span></p>
                          <p class="tag"></p>
                        </div>
                        <div class="ns " onclick="dataLayer.push({'event':'custom_event','event_category':'button','event_action':'click_on_session_on_main','event_label':''});" data-id="0000000017-224069" data-name="ШТТЛ" data-moviehref="/movie/355542" data-low="17000" data-high="27000">
                          <p class="time"><span>19:20</span></p>
                          <p class="tag"></p>
                        </div>
                        <div class="ns " onclick="dataLayer.push({'event':'custom_event','event_category':'button','event_action':'click_on_session_on_main','event_label':''});" data-id="0000000017-224090" data-name="ШТТЛ" data-moviehref="/movie/355542" data-low="17000" data-high="27000">
                          <p class="time"><span>20:20</span></p>
                          <p class="tag"></p>
                        </div>
                        <div class="ns " onclick="dataLayer.push({'event':'custom_event','event_category':'button','event_action':'click_on_session_on_main','event_label':''});" data-id="0000000017-224146" data-name="ШТТЛ" data-moviehref="/movie/355542" data-low="17000" data-high="27000">
                          <p class="time"><span>21:20</span></p>
                          <p class="tag"></p>
                        </div>
`
  const root = parse(html)
  const filteredShowtimes: HTMLElement[] = root.querySelectorAll('.ns')
  return filteredShowtimes
}

