import { TestBed } from '@angular/core/testing';
import { ApplicationRef } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ProjectService } from './project.service';
import { Project } from '../models';

const PROJECTS: Project[] = [
  { id: 'p1', name: 'Alpha', description: '', status: 'active', progress: 40, startDate: '', endDate: '', teamMemberIds: [], taskIds: [] },
  { id: 'p2', name: 'Beta', description: '', status: 'completed', progress: 100, startDate: '', endDate: '', teamMemberIds: [], taskIds: [] },
  { id: 'p3', name: 'Gamma', description: '', status: 'on-hold', progress: 10, startDate: '', endDate: '', teamMemberIds: [], taskIds: [] },
];

describe('ProjectService (httpResource)', () => {
  let service: ProjectService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ProjectService);
    http = TestBed.inject(HttpTestingController);
    // httpResource programa la petición como efecto: tick() la dispara
    TestBed.inject(ApplicationRef).tick();
  });

  async function flushInitialLoad(data: Project[] = PROJECTS): Promise<void> {
    http.expectOne('/api/projects').flush(data);
    await vi.waitFor(() => expect(service.projects().length).toBe(data.length));
  }

  it('carga la lista al crearse y expone loading', async () => {
    expect(service.loading()).toBe(true);
    await flushInitialLoad();
    expect(service.loading()).toBe(false);
    expect(service.projects()).toEqual(PROJECTS);
  });

  it('calcula los computeds derivados', async () => {
    await flushInitialLoad();
    expect(service.projectCount()).toBe(3);
    expect(service.activeProjects().map(p => p.id)).toEqual(['p1']);
    expect(service.byStatus()['on-hold'].map(p => p.id)).toEqual(['p3']);
    expect(service.avgProgress()).toBe(50); // (40+100+10)/3
  });

  it('add hace POST y añade el proyecto creado sin refetch', async () => {
    await flushInitialLoad();
    service.add({ ...PROJECTS[0], name: 'Delta' } as Omit<Project, 'id'>);
    const req = http.expectOne('/api/projects');
    expect(req.request.method).toBe('POST');
    req.flush({ ...PROJECTS[0], id: 'p4', name: 'Delta' });
    await vi.waitFor(() => expect(service.projectCount()).toBe(4));
  });

  it('update hace PATCH y reemplaza el proyecto', async () => {
    await flushInitialLoad();
    service.update('p1', { progress: 80 });
    const req = http.expectOne('/api/projects/p1');
    expect(req.request.method).toBe('PATCH');
    req.flush({ ...PROJECTS[0], progress: 80 });
    await vi.waitFor(() => expect(service.projectById('p1')()?.progress).toBe(80));
  });

  it('remove hace DELETE y quita el proyecto de la lista', async () => {
    await flushInitialLoad();
    service.remove('p2');
    http.expectOne('/api/projects/p2').flush({});
    await vi.waitFor(() => expect(service.projectCount()).toBe(2));
    expect(service.projectById('p2')()).toBeUndefined();
  });

  it('un error de mutación queda expuesto en error()', async () => {
    await flushInitialLoad();
    service.remove('p1');
    http.expectOne('/api/projects/p1').flush('boom', { status: 500, statusText: 'Server Error' });
    await vi.waitFor(() => expect(service.error()).toBeTruthy());
    // la lista no se toca si el servidor falla
    expect(service.projectCount()).toBe(3);
  });
});
