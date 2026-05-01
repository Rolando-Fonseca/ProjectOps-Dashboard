export type ProjectStatus = 'active' | 'on-hold' | 'completed' | 'archived';

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  progress: number;
  startDate: string;
  endDate: string;
  teamMemberIds: string[];
  taskIds: string[];
}
