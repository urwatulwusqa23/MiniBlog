import { Component, OnInit, signal, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from '../../core/services/message.service';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { Message, Contact } from '../../core/models/models';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="messages-page">

      <!-- Contacts panel -->
      <div class="contacts-panel glass">
        <div class="contacts-head">
          <h2 class="contacts-title">Messages</h2>
        </div>

        @if (contacts().length === 0) {
          <div class="no-contacts">
            <i class="fas fa-comment-slash"></i>
            <p>No conversations yet.<br>Start chatting with someone!</p>
          </div>
        } @else {
          <div class="contacts-list">
            @for (c of contacts(); track c.id) {
              <div class="contact-item" [class.is-active]="activeId() === c.id" (click)="openChat(c)">
                <div class="contact-avatar-wrap">
                  <img [src]="avatarUrl(c.profilePicture)" class="avatar avatar-sm"
                       (error)="onImgErr($event)" [alt]="c.username">
                  <div class="online-dot"></div>
                </div>
                <span class="contact-name">{{ c.username }}</span>
              </div>
            }
          </div>
        }
      </div>

      <!-- Chat panel -->
      <div class="chat-panel glass">
        @if (!activeContact()) {
          <div class="chat-empty">
            <div class="chat-empty-icon">
              <i class="fas fa-comments"></i>
            </div>
            <p>Select a contact to start a conversation</p>
          </div>
        } @else {
          <!-- Chat header -->
          <div class="chat-header">
            <img [src]="avatarUrl(activeContact()!.profilePicture)" class="avatar avatar-sm"
                 (error)="onImgErr($event)">
            <div class="chat-header-info">
              <span class="chat-name">{{ activeContact()!.username }}</span>
              <span class="chat-status">Active</span>
            </div>
          </div>

          <!-- Messages -->
          <div class="messages-list" #msgList>
            @if (loadingMsgs()) {
              <div class="spinner" style="margin: 60px auto"></div>
            } @else if (messages().length === 0) {
              <div class="no-msgs">
                <i class="far fa-comment-dots"></i>
                <p>No messages yet. Say hello! ðŸ‘‹</p>
              </div>
            } @else {
              @for (msg of messages(); track msg.id) {
                <div class="msg-row" [class.is-mine]="msg.senderId === myId()">
                  <div class="bubble" [class.mine-bubble]="msg.senderId === myId()">
                    {{ msg.content }}
                  </div>
                  <span class="msg-time">{{ msg.timestamp | date:'h:mm a' }}</span>
                </div>
              }
            }
          </div>

          <!-- Input -->
          <div class="chat-input-area">
            <textarea
              class="form-control msg-ta"
              [(ngModel)]="msgText"
              placeholder="Type a messageâ€¦"
              rows="1"
              (keydown.enter)="$event.preventDefault(); sendMsg()"
            ></textarea>
            <button class="send-btn" (click)="sendMsg()" [disabled]="!msgText.trim() || sending()">
              @if (sending()) { <span class="spinner spinner-sm"></span> }
              @else { <i class="fas fa-paper-plane"></i> }
            </button>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .messages-page {
      display: flex;
      gap: 16px;
      height: calc(100vh - 80px);
      max-width: 900px;
      margin: 0 auto;
    }

    /* â”€â”€ Contacts panel â”€â”€ */
    .contacts-panel {
      width: 260px;
      flex-shrink: 0;
      border-radius: var(--radius-xl);
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .contacts-head {
      padding: 18px 18px 14px;
      border-bottom: 1px solid var(--border);
    }

    .contacts-title {
      font-family: var(--font-display);
      font-size: 18px;
      font-weight: 700;
      color: var(--text-primary);
    }

    .contacts-list { overflow-y: auto; flex: 1; padding: 8px; }

    .contact-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 12px;
      border-radius: var(--radius-lg);
      cursor: pointer;
      transition: var(--transition);

      &:hover { background: var(--surface-2); }
      &.is-active {
        background: rgba(139,92,246,0.12);
        border: 1px solid rgba(139,92,246,0.2);
      }
    }

    .contact-avatar-wrap { position: relative; flex-shrink: 0; }

    .online-dot {
      position: absolute;
      bottom: 0; right: 0;
      width: 9px; height: 9px;
      background: var(--success);
      border-radius: 50%;
      border: 2px solid var(--bg);
    }

    .contact-name {
      font-size: 14px;
      font-weight: 500;
      color: var(--text-primary);
      flex: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .no-contacts {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 20px;
      text-align: center;
      color: var(--text-muted);
      gap: 10px;
      i { font-size: 32px; opacity: .3; }
      p { font-size: 13px; line-height: 1.5; }
    }

    /* â”€â”€ Chat panel â”€â”€ */
    .chat-panel {
      flex: 1;
      min-width: 0;
      border-radius: var(--radius-xl);
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .chat-empty {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 14px;
      color: var(--text-muted);
      p { font-size: 15px; }
    }

    .chat-empty-icon {
      width: 72px; height: 72px;
      background: var(--surface-2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      i { font-size: 28px; color: var(--accent); opacity: .5; }
    }

    .chat-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 20px;
      border-bottom: 1px solid var(--border);
      flex-shrink: 0;
    }

    .chat-header-info { display: flex; flex-direction: column; }
    .chat-name { font-size: 15px; font-weight: 700; color: var(--text-primary); }
    .chat-status { font-size: 11px; color: var(--success); }

    .messages-list {
      flex: 1;
      overflow-y: auto;
      padding: 16px 20px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .msg-row {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 3px;
      max-width: 72%;

      &.is-mine { align-self: flex-end; align-items: flex-end; }
    }

    .bubble {
      padding: 10px 15px;
      border-radius: 18px 18px 18px 5px;
      background: var(--surface-2);
      color: var(--text-primary);
      font-size: 14px;
      line-height: 1.5;
      word-break: break-word;

      &.mine-bubble {
        background: var(--gradient);
        color: #fff;
        border-radius: 18px 18px 5px 18px;
        box-shadow: 0 2px 12px rgba(139,92,246,0.25);
      }
    }

    .msg-time { font-size: 10px; color: var(--text-muted); padding: 0 4px; }

    .no-msgs {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 10px;
      color: var(--text-muted);
      i { font-size: 32px; opacity: .25; }
      p { font-size: 15px; }
    }

    .chat-input-area {
      display: flex;
      gap: 10px;
      padding: 14px 18px;
      border-top: 1px solid var(--border);
      flex-shrink: 0;
      align-items: flex-end;
    }

    .msg-ta {
      flex: 1;
      min-height: 42px;
      max-height: 120px;
      padding: 10px 14px;
      resize: none;
      font-size: 14px;
    }

    .send-btn {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: var(--gradient);
      border: none;
      color: #fff;
      font-size: 15px;
      cursor: pointer;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: var(--transition);
      box-shadow: 0 2px 12px var(--glow);
      &:hover:not(:disabled) { box-shadow: 0 4px 20px rgba(139,92,246,0.4); transform: scale(1.05); }
      &:disabled { opacity: 0.5; cursor: not-allowed; }
    }

    @media (max-width: 640px) {
      .messages-page { flex-direction: column; height: auto; }
      .contacts-panel { width: 100%; max-height: 150px; }
      .chat-panel { min-height: 400px; }
    }
  `]
})
export class MessagesComponent implements OnInit, AfterViewChecked {
  @ViewChild('msgList') msgList!: ElementRef;

  contacts      = signal<Contact[]>([]);
  messages      = signal<Message[]>([]);
  activeContact = signal<Contact | null>(null);
  activeId      = signal<number | null>(null);
  loadingMsgs   = signal(false);
  sending       = signal(false);
  myId          = this.auth.currentUserId;
  msgText       = '';

  constructor(
    private msgSvc: MessageService,
    private userSvc: UserService,
    private auth: AuthService,
    private route: ActivatedRoute,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    this.msgSvc.getContacts().subscribe({
      next: contacts => {
        this.contacts.set(contacts);
        const cid = Number(this.route.snapshot.paramMap.get('id'));
        if (cid) {
          const c = contacts.find(x => x.id === cid);
          if (c) this.openChat(c);
        }
      },
      error: () => {},
    });
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  openChat(contact: Contact): void {
    this.activeContact.set(contact);
    this.activeId.set(contact.id);
    this.loadingMsgs.set(true);
    this.msgSvc.getConversation(contact.id).subscribe({
      next: msgs => { this.messages.set(msgs); this.loadingMsgs.set(false); },
      error: () => this.loadingMsgs.set(false),
    });
  }

  sendMsg(): void {
    const text    = this.msgText.trim();
    const contact = this.activeContact();
    if (!text || !contact) return;
    this.sending.set(true);

    this.msgSvc.send(contact.id, text).subscribe({
      next: () => {
        this.messages.update(m => [...m, {
          id: Date.now(),
          senderId: this.auth.currentUserId()!,
          receiverId: contact.id,
          content: text,
          timestamp: new Date().toISOString(),
          isRead: false,
        }]);
        this.msgText = '';
        this.sending.set(false);
      },
      error: () => { this.sending.set(false); this.toast.error('Failed to send message'); },
    });
  }

  avatarUrl(pic: string | null | undefined): string {
    return this.userSvc.avatarUrl(pic);
  }

  onImgErr(e: Event): void {
    const img = e.target as HTMLImageElement; if (!img.src.includes('default-avatar')) img.src = '/assets/default-avatar.svg';
  }

  private scrollToBottom(): void {
    try {
      const el = this.msgList?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    } catch {}
  }
}

