import { ChangeDetectorRef, Component, NgZone, OnInit, ViewChild, ElementRef, AfterViewInit, Input } from '@angular/core';
import { ReactiveFormsModule, FormControl, Validators, FormGroup } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { CharacterService } from '../services/character.service';

@Component({
  selector: 'app-chat-app',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './chat-app.html',
  styleUrl: './chat-app.scss',
})
export class ChatApp implements OnInit, AfterViewInit {

  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;
  @Input() characterId: number = 1;

  constructor(
    private cdr: ChangeDetectorRef,
    private zone: NgZone,
    private characterService: CharacterService
  ) { }

  chatControlForm = new FormGroup({
    chatInput: new FormControl<string>('', {
      validators: [Validators.required]
    }),
  });

  url = 'http://localhost:11434/api/chat';

  conversation: { role: string; content: string | null }[] = [];

  // 🔥 STATE
  private streamBuffer = '';
  private typingInterval: any;
  isTyping = false;
  isStreamingActive = false;

  ngOnInit(): void { }

  submit() {
    const userMessage = this.chatControlForm.controls.chatInput.value;
    if (!userMessage) return;

    // reset state
    this.streamBuffer = '';
    this.isStreamingActive = true;

    // user message
    this.conversation.push({
      role: 'user',
      content: userMessage
    });

    // assistant placeholder
    this.conversation.push({
      role: 'assistant',
      content: null
    });

    this.scrollToBottom();

    const payload = {
      model: 'gemma3',
      messages: [
        {
          role: 'system',
          content: this.characterService.getCharacterPrompt(this.characterId)
        },
        ...this.conversation.filter(m => m.content !== null)
      ]
    };

    // 🔥 USE FETCH STREAMING
    this.streamResponse(payload);

    this.chatControlForm.reset();
  }

  async streamResponse(payload: any) {
    const response = await fetch(this.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    let buffer = '';

    const lastMessage = this.conversation[this.conversation.length - 1];

    if (lastMessage.content === null) {
      lastMessage.content = '';
    }

    while (true) {
      const { done, value } = await reader!.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // keep incomplete line

      for (const line of lines) {
        if (!line.trim()) continue;

        try {
          const parsed = JSON.parse(line);

          // push into animation buffer
          this.streamBuffer += parsed.message?.content ?? '';

          if (!this.isTyping) {
            this.startTypingAnimation(lastMessage);
          }

        } catch {
          // ignore broken JSON, wait for next chunk
        }
      }

      this.zone.run(() => {
        this.cdr.detectChanges();
        this.cdr.markForCheck(); // Extra robustness
        this.scrollToBottom();
      });
    }

    this.zone.run(() => {
      this.isStreamingActive = false;
      this.cdr.detectChanges();
    });
  }

  // 🔥 WORD-BY-WORD TYPING
  startTypingAnimation(message: any) {
    this.isTyping = true;

    this.typingInterval = setInterval(() => {
      if (!this.streamBuffer.length) {
        if (!this.isStreamingActive) {
          this.zone.run(() => {
            clearInterval(this.typingInterval);
            this.isTyping = false;
            this.cdr.detectChanges();
          });
        }
        return;
      }

      this.zone.run(() => {
        // smoother word detection
        const match = this.streamBuffer.match(/^(.+?\s)/);

        if (match) {
          const word = match[0];
          message.content += word;
          this.streamBuffer = this.streamBuffer.slice(word.length);
        } else if (!this.isStreamingActive) {
          // 👇 FINAL FLUSH (important)
          message.content += this.streamBuffer;
          this.streamBuffer = '';
        }

        this.cdr.detectChanges();
        this.cdr.markForCheck();
        this.scrollToBottom();
      });

    }, 30);
  }

  ngAfterViewInit() {
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    try {
      setTimeout(() => {
        this.scrollContainer.nativeElement.scrollTop =
          this.scrollContainer.nativeElement.scrollHeight;
      }, 0);
    } catch (err) {
      console.log(err);
    }
  }
}