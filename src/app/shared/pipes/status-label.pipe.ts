import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ standalone: true, name: 'statusLabel' })
export class StatusLabelPipe implements PipeTransform {
  private readonly labels: Record<string, string> = {
    active: 'Active',
    'on-hold': 'On Hold',
    completed: 'Completed',
    archived: 'Archived',
    todo: 'To Do',
    'in-progress': 'In Progress',
    review: 'Review',
    done: 'Done',
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    critical: 'Critical',
  };

  transform(value: string): string {
    return this.labels[value] ?? value;
  }
}
