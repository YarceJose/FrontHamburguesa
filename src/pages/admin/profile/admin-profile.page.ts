import { DatePipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { AuthService } from '../../../core/auth/auth.service';
import { initialsOf, TopbarComponent } from '../../../shared/components/topbar/topbar.component';

/** Admin profile (Figma Frame 3: profile card + personal information). */
@Component({
  selector: 'app-admin-profile-page',
  imports: [DatePipe, TopbarComponent],
  templateUrl: './admin-profile.page.html',
  styleUrl: './admin-profile.page.scss',
})
export class AdminProfilePage {
  protected readonly user = inject(AuthService).user;
  protected readonly initials = computed(() => initialsOf(this.user()?.fullName ?? ''));
}
