import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'time'
})
export class TimePipe implements PipeTransform {

  transform(value: number, args?: any): any {
    return `${Math.floor(value / 60)}:${('0' + (value % 60)).slice(-2)}`;
  }

}
