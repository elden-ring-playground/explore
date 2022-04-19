import { Pipe, PipeTransform, Sanitizer, SecurityContext } from '@angular/core';

@Pipe({
  name: 'boldSpan'
})
export class BoldSpanPipe implements PipeTransform {

  constructor(
    //private sanitizer: Sanitizer
  ) {}

  public transform(value: string, regex: string): any {
    return value.replace(new RegExp(`(${regex})`, 'gi'), '<span class=\"match\">$1</span>');
    //return this.sanitize(this.replace(value, regex));
  }

  /*
  public replace(str: string, regex: any) {
    return str.replace(new RegExp(`(${regex})`, 'gi'), '<b>$1</b>');
  }

  public sanitize(str: string) {
    return this.sanitizer.sanitize(SecurityContext.HTML, str);
  }
  */
}
