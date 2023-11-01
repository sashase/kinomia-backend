import { HTMLElement, parse } from 'node-html-parser'

export const filteredShowtimesStub = (format?: string): HTMLElement[] => {
  let html: string
  switch (format) {
    case 'LUX':
      html = `
            <div class="ns " onclick="dataLayer.push({'event':'custom_event','event_category':'button','event_action':'click_on_session_on_main','event_label':''});" data-id="0000000017-224146" data-name="ШТТЛ" data-moviehref="/movie/355542" data-low="17000" data-high="27000">
              <p class="time"><span>18:20</span></p>
              <p class="tag">LUX</p>
            </div>
      `
      break

    default:
      html = `
            <div class="ns " onclick="dataLayer.push({'event':'custom_event','event_category':'button','event_action':'click_on_session_on_main','event_label':''});" data-id="0000000017-224146" data-name="ШТТЛ" data-moviehref="/movie/355542" data-low="17000" data-high="27000">
              <p class="time"><span>18:20</span></p>
              <p class="tag"></p>
            </div>
      `
      break
  }

  const root = parse(html)
  const filteredShowtimes: HTMLElement[] = root.querySelectorAll('.ns')
  return filteredShowtimes
}

