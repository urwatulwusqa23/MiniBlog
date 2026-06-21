import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      @for (toast of svc.toasts(); track toast.id) {
        <div class="toast toast-{{ toast.type }}" [class.toast-exit]="toast.exiting">
          <i class="fas" [ngClass]="{
            'fa-circle-check':     toast.type === 'success',
            'fa-circle-xmark':     toast.type === 'error',
            'fa-triangle-exclamation': toast.type === 'warning',
            'fa-circle-info':      toast.type === 'info'
          }"></i>
          <span class="toast-msg">{{ toast.message }}</span>
          <button class="toast-dismiss" (click)="svc.dismiss(toast.id)" aria-label="Dismiss">
            <i class="fas fa-xmark"></i>
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-msg { flex: 1; min-width: 0; }
    .toast-dismiss {
      background: none;
      border: none;
      color: rgba(255,255,255,0.7);
      cursor: pointer;
      font-size: 13px;
      padding: 2px 4px;
      border-radius: 4px;
      line-height: 1;
      flex-shrink: 0;
      transition: color .15s;
      &:hover { color: #fff; }
    }
  `]
})
export class ToastContainerComponent {
  constructor(readonly svc: ToastService) {}
}
