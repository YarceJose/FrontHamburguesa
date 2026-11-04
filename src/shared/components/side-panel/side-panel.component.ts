import { Component, effect, input, output } from '@angular/core';

/**
 * Panel that expands the current view: bottom sheet on phones, right-hand drawer from tablets up.
 * Closes with Esc or by tapping the backdrop, and locks page scroll while open.
 */
@Component({
  selector: 'app-side-panel',
  templateUrl: './side-panel.component.html',
  styleUrl: './side-panel.component.scss',
  host: { '(document:keydown.escape)': 'open() && closed.emit()' },
})
export class SidePanelComponent {
  readonly open = input(false);
  readonly label = input.required<string>();
  readonly closed = output<void>();

  constructor() {
    effect((onCleanup) => {
      document.body.classList.toggle('no-scroll', this.open());
      onCleanup(() => document.body.classList.remove('no-scroll'));
    });
  }
}
