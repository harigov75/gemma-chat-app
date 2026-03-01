import { ChangeDetectorRef, Component, NgZone, OnInit, ViewChild, ElementRef, AfterViewInit, Input } from '@angular/core';
import { ReactiveFormsModule, FormControl, Validators, FormGroup } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpEventType } from '@angular/common/http';
import { CharacterService } from '../services/character.service';

@Component({
  selector: 'app-chat-app',
  standalone: true,
  imports: [CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,],
  templateUrl: './chat-app.html',
  styleUrl: './chat-app.scss',
})
export class ChatApp implements OnInit, AfterViewInit {
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  @Input() characterId: number = 1;

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private zone: NgZone,
    private characterService: CharacterService
  ) { }

  chatControlForm = new FormGroup({
    chatInput: new FormControl<string>('', {
      validators: [Validators.required]
    }),
  });

  url = 'http://localhost:11434/api/chat'
  response: any
  output = ''
  conversation: { role: string; content: string | null }[] = [];

  ngOnInit(): void {
    // Initialization logic if needed
  }

  submit() {
    console.log(this.chatControlForm.controls.chatInput.value)
    const userMessage = this.chatControlForm.controls.chatInput.value;
    this.conversation.push({
      role: 'user',
      content: userMessage
    });
    this.scrollToBottom();
    let payload = {
      model: 'gemma3',
      messages: [
        {
          "role": "system",
          "content": this.characterService.getCharacterPrompt(this.characterId)
        },
        ...this.conversation
      ]
    }

    this.http.post(this.url, payload, {
      observe: "events",
      responseType: "text",
      reportProgress: true
    }).subscribe({
      next: (res: any) => {
        this.zone.run(() => {
          if (res.type === HttpEventType.DownloadProgress && res.partialText) {
            const lines = res.partialText.split('\n');
            this.output = '';

            for (const line of lines) {
              if (!line.trim()) continue;
              try {
                const parsed = JSON.parse(line);
                this.output += parsed.message?.content ?? '';
              } catch { }
            }

            this.cdr.detectChanges();
            this.scrollToBottom();
          }

          if (res.type === HttpEventType.Response) {
            this.conversation.push({
              role: 'assistant',
              content: this.output
            });
            this.cdr.detectChanges();
            this.scrollToBottom();
          }
        });
      },
      error: (err) => {
        console.error('API Error:', err);
      }
    });

    this.chatControlForm.reset();
  }


  ngAfterViewInit() {
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    try {
      setTimeout(() => {
        this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
      }, 0);
    } catch (err) {
      console.log(err);
    }
  }


}
