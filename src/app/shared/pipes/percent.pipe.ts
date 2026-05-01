import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ standalone: true, name: 'percentValue' })
export class PercentValuePipe implements PipeTransform {
  transform(value: number, decimals = 0): string {
    return value.toFixed(decimals) + '%';
  }
}
