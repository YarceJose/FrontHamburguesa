import { Component, input, output } from '@angular/core';
import { StaffNotice } from '../../../core/realtime/order-board.store';

/** Real-time notices (new order, receipt to check, delays) stacked at the bottom of staff views. */
@Component({
  selector: 'app-live-notices',
  template: `
    <div class="zone" aria-live="assertive">
      @for (notice of notices(); track notice.id) {
        <p class="notice" [attr.data-kind]="notice.kind">
          <span>{{ notice.text }}</span>
          <button type="button" aria-label="Cerrar aviso" (click)="dismiss.emit(notice.id)">×</button>
        </p>
      }
    </div>
  `,
  styles: `
    .zone { position: fixed; z-index: 20; left: 50%; bottom: max(16px, env(safe-area-inset-bottom)); transform: translateX(-50%);
            width: min(calc(100% - 32px), 460px); display: grid; gap: 8px; }
    .notice { display: flex; align-items: center; gap: 12px; padding: 12px 14px; border-radius: var(--radius-md);
              background: var(--color-background); color: var(--color-white); font-size: 0.88rem;
              box-shadow: 0 18px 40px -12px rgb(0 10 30 / 0.6); border-left: 4px solid var(--color-success); animation: pop 0.25s ease; }
    .notice span { flex: 1; }
    .notice[data-kind='payment'] { border-left-color: var(--color-tertiary); }
    .notice[data-kind='delayed'] { border-left-color: var(--color-secondary); }
    .notice[data-kind='escalated'] { border-left-color: var(--color-danger); background: #5a0a03; }
    .notice[data-kind='info'] { border-left-color: #8ab4f8; }
    button { border: none; background: none; color: inherit; font-size: 1.2rem; line-height: 1; opacity: 0.7; }
    @keyframes pop { from { transform: translateY(12px); opacity: 0; } }
  `,
})
export class LiveNoticesComponent {
  readonly notices = input.required<StaffNotice[]>();
  readonly dismiss = output<number>();
}
