import { HTMLElement, parse } from 'node-html-parser'

export const cityElementStub = (): HTMLElement => {
  const html: string = '<div class="rm_clist" style = "display: block;" data-cityname="Київ" > <p class="heading heading--inverse" > Кінотеатр: </p><div class="cinema active" data-id="0000000017" data-name="Lavina IMAX Лазер"><div class="c_left"><p class="cname_s cname"><span>Lavina IMAX Лазер</span > </p><p class="address">вул. Берковецька, 6Д</p > </div><a href="/cinema / kyiv / lavina" class="about cname"><img src=" / img / rm_sch.png" title="Розклад сеансів" alt="Розклад сеансів">Розклад сеансів </a></div></div>'
  const root = parse(html)
  const city = root.querySelector('.rm_clist')
  return city
}

