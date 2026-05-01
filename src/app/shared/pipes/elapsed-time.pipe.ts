import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ standalone: true, name: 'elapsedTime' })
export class ElapsedTimePipe implements PipeTransform {
  transform(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      const abs = Math.abs(diffDays);
      return abs === 1 ? 'Tomorrow' : `In ${abs} days`;
    }
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 30) return `${diffDays} days ago`;
    const months = Math.floor(diffDays / 30);
    return months === 1 ? '1 month ago' : `${months} months ago`;
  }
}
