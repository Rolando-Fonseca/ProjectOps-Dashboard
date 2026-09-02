import { Component, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TeamService } from '../../core/services/team.service';
import { ProjectService } from '../../core/services/project.service';
import { MemberCard } from './member-card.component';
import { Modal } from '../../shared/ui/modal.component';
import { LoadingSpinner } from '../../shared/ui/loading-spinner.component';
import { EmptyState } from '../../shared/ui/empty-state.component';
import { TeamMember } from '../../core/models';

@Component({
  selector: 'app-team-overview',
  standalone: true,
  imports: [MemberCard, Modal, FormsModule, LoadingSpinner, EmptyState],
  template: `
    <div class="team-overview">
      <div class="team-overview__header">
        <div>
          <h1>Team</h1>
          <span class="team-overview__count">{{ teamService.memberCount() }} members</span>
        </div>
        <div class="team-overview__actions">
          <input class="team-overview__search-input" type="text" placeholder="Search members..."
            [value]="searchQuery()" (input)="onSearch($event)" />
          <button class="team-overview__add" (click)="openAdd()">+ Add Member</button>
        </div>
      </div>

      <div class="team-overview__roles">
        @for (item of teamService.roleBreakdown(); track item.role) {
          <span class="team-overview__role-chip">{{ item.role }} ({{ item.count }})</span>
        }
      </div>

      @if (teamService.loading()) {
        <app-loading-spinner message="Loading team..." />
      } @else if (filteredMembers().length === 0) {
        <app-empty-state [message]="'No members match your search'" />
      } @else {
        <div class="team-overview__grid">
          @for (member of filteredMembers(); track member.id) {
            <app-member-card [member]="member" (edit)="openEdit(member)" (delete)="removeMember(member.id)" />
          }
        </div>
      }
    </div>

    <app-modal [open]="modalOpen()" [title]="editingId() ? 'Edit Member' : 'New Member'" (cancel)="closeModal()">
      <form class="form" (ngSubmit)="save()">
        <label class="form__label">Name
          <input class="form__input" [(ngModel)]="form.name" name="name" required />
        </label>
        <div class="form__row">
          <label class="form__label">Role
            <input class="form__input" [(ngModel)]="form.role" name="role" />
          </label>
          <label class="form__label">Email
            <input class="form__input" type="email" [(ngModel)]="form.email" name="email" />
          </label>
        </div>
        <label class="form__label">Projects
          <div class="form__checkboxes">
            @for (p of projectService.projects(); track p.id) {
              <label class="form__checkbox">
                <input type="checkbox" [checked]="form.projectIds.includes(p.id)"
                  (change)="toggleProject(p.id)" />
                {{ p.name }}
              </label>
            }
          </div>
        </label>
        <div class="form__actions">
          <button class="form__btn form__btn--secondary" type="button" (click)="closeModal()">Cancel</button>
          <button class="form__btn form__btn--primary" type="submit">{{ editingId() ? 'Update' : 'Create' }}</button>
        </div>
      </form>
    </app-modal>
  `,
  styles: [`
    .team-overview__header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 0.75rem; flex-wrap: wrap; gap: 0.75rem; }
    .team-overview__header h1 { margin: 0; font-size: 1.5rem; font-weight: 700; color: var(--text); }
    .team-overview__count { font-size: 0.75rem; color: var(--text-muted); }
    .team-overview__actions { display: flex; align-items: center; gap: 0.5rem; }
    .team-overview__search-input {
      padding: 0.375rem 0.75rem; border: 1px solid var(--border); border-radius: 0.375rem;
      font-size: 0.8125rem; outline: none; width: 180px; transition: border-color 0.15s ease;
    }
    .team-overview__search-input:focus { border-color: #3b82f6; }
    .team-overview__add {
      padding: 0.375rem 0.75rem; border-radius: 0.375rem; border: none;
      background: #10b981; color: #ffffff; font-size: 0.75rem; font-weight: 600; cursor: pointer;
    }
    .team-overview__add:hover { background: #059669; }
    .team-overview__roles { display: flex; flex-wrap: wrap; gap: 0.375rem; margin-bottom: 1.25rem; }
    .team-overview__role-chip { font-size: 0.6875rem; color: var(--text-secondary); background: var(--border-soft); padding: 0.25rem 0.5rem; border-radius: 0.25rem; }
    .team-overview__grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 0.75rem; }
    .form { display: flex; flex-direction: column; gap: 0.875rem; }
    .form__label { display: flex; flex-direction: column; gap: 0.25rem; font-size: 0.8125rem; font-weight: 500; color: var(--text-secondary); }
    .form__input { padding: 0.5rem 0.625rem; border: 1px solid var(--border); border-radius: 0.375rem; font-size: 0.8125rem; outline: none; }
    .form__input:focus { border-color: #3b82f6; }
    .form__row { display: flex; gap: 0.75rem; }
    .form__row > .form__label { flex: 1; }
    .form__checkboxes { display: flex; flex-wrap: wrap; gap: 0.5rem; }
    .form__checkbox { display: flex; align-items: center; gap: 0.25rem; font-size: 0.75rem; color: var(--text-secondary); cursor: pointer; }
    .form__actions { display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 0.5rem; }
    .form__btn { padding: 0.5rem 1rem; border-radius: 0.375rem; border: none; font-size: 0.8125rem; font-weight: 600; cursor: pointer; }
    .form__btn--secondary { background: var(--border-soft); color: var(--text-secondary); }
    .form__btn--primary { background: #3b82f6; color: #ffffff; }
    .form__btn--primary:hover { background: #2563eb; }
  `],
})
export class TeamOverview {
  protected readonly teamService = inject(TeamService);
  protected readonly projectService = inject(ProjectService);
  protected readonly searchQuery = signal('');
  protected readonly modalOpen = signal(false);
  protected readonly editingId = signal<string | null>(null);
  protected form = { name: '', role: '', email: '', avatar: '', projectIds: [] as string[] };

  readonly filteredMembers = computed(() => {
    const query = this.searchQuery().toLowerCase();
    const members = this.teamService.members();
    if (!query) return members;
    return members.filter(m => m.name.toLowerCase().includes(query) || m.role.toLowerCase().includes(query));
  });

  onSearch(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  openAdd(): void {
    this.editingId.set(null);
    this.form = { name: '', role: '', email: '', avatar: '', projectIds: [] };
    this.modalOpen.set(true);
  }

  openEdit(member: TeamMember): void {
    this.editingId.set(member.id);
    this.form = { name: member.name, role: member.role, email: member.email, avatar: member.avatar, projectIds: [...member.projectIds] };
    this.modalOpen.set(true);
  }

  closeModal(): void { this.modalOpen.set(false); }

  toggleProject(projectId: string): void {
    const ids = [...this.form.projectIds];
    const idx = ids.indexOf(projectId);
    if (idx >= 0) ids.splice(idx, 1); else ids.push(projectId);
    this.form.projectIds = ids;
  }

  save(): void {
    if (!this.form.name.trim()) return;
    const avatar = this.form.avatar || this.form.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    const id = this.editingId();
    if (id) {
      this.teamService.update(id, { ...this.form, avatar });
    } else {
      this.teamService.add({ ...this.form, avatar });
    }
    this.closeModal();
  }

  removeMember(id: string): void {
    if (confirm('Remove this team member?')) this.teamService.remove(id);
  }
}
