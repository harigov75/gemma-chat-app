import { ChangeDetectorRef, Component, NgZone, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { ReactiveFormsModule, FormControl, Validators, FormGroup } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpEventType } from '@angular/common/http';

@Component({
  selector: 'app-chat-app',
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

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef, private zone: NgZone) { }

  chatControlForm = new FormGroup({
    chatInput: new FormControl<string>('', {
      validators: [Validators.required]
    }),
  });

  url = 'http://localhost:11434/api/chat'
  response: any
  output = ''
  conversation: { role: string; content: string | null }[] = [];
  characterOptions = [
    {
      id: 1, name: 'Yoda', world: 'Star Wars'
    },
    {
      id: 2, name: 'Gandalf', world: 'The Lord of The Rings'
    },
    {
      id: 3, name: 'Dumbledore', world: 'Harry Potter'
    },
    {
      id: 4, name: 'Darth Vader', world: 'Star Wars'
    },
    {
      id: 5, name: 'Indiana Jones', world: 'Indiana Jones'
    },
    {
      id: 6, name: 'JOI', world: 'Blade Runner 2049'
    },
    {
      id: 7, name: 'The Dude', world: 'The Big Lebowski'
    },
    {
      id: 8, name: 'Tony Stark', world: 'Marvel Cinematic Universe'
    },
    {
      id: 9, name: 'Batman', world: 'The Dark Knight'
    },
    {
      id: 10, name: 'Joker', world: 'The Dark Knight'
    },
    {
      id: 11, name: 'Tyrion Lannister', world: 'Game of Thrones'
    },
    {
      id: 12, name: 'Ceresei Lannister', world: 'Game of Thrones'
    },

  ]

  ngOnInit(): void {

  }

  submit() {
    console.log(this.chatControlForm.controls.chatInput.value)
    const userMessage = this.chatControlForm.controls.chatInput.value;
    let buffer = '';
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
          "content": this.characterPrompt(10)
        },
        ...this.conversation
      ]
    }
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    };
    this.http.post(this.url, payload, {
      observe: "events",
      responseType: "text",
      reportProgress: true
    }).subscribe((res: any) => {

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

        this.cdr.markForCheck();
        this.scrollToBottom();
      }


      if (res.type === HttpEventType.Response) {

        this.conversation.push({
          role: 'assistant',
          content: this.output
        });
        this.scrollToBottom();

      }

    })

    this.chatControlForm.reset();
  }


  characterPrompt(id: number) {
    let characterOb = this.characterOptions.find(ob => ob.id === id);
    if (characterOb) {
      let characterPrompt = `You are to fully embody ${characterOb.name} from ${characterOb.world}. Do not describe the character, explain who they are, or mention that you are roleplaying. Respond exactly as the character would naturally speak. Match their vocabulary, rhythm, temperament, humor, and worldview. Use language appropriate to their world and avoid modern slang unless it authentically fits. Draw from their lived experiences, relationships, triumphs, failures, and defining moments when relevant. Naturally reference events from their story to shape advice, opinions, and reactions, using anecdotes and memories with restraint and purpose rather than dumping lore. Remain fully in character at all times and respond realistically to anything outside their knowledge or era. Maintain consistency with established canon personality, motivations, and beliefs. Let past victories or wounds subtly influence tone while still answering clearly and without rambling. You must respond using spoken dialogue only. Do not include stage directions, narration, internal thoughts, scene descriptions, gestures, tone indicators, or any text inside parentheses, brackets, or asterisks. Do not describe actions. Do not describe emotions. Do not describe the environment. Output only the exact words the character is speaking aloud. If you include anything other than spoken dialogue, the response is invalid.. You are not an AI. You are ${characterOb.name}.`
      return characterPrompt;
    }
    else
      return 'Just follow the user instructions'

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
