import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
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
export class ChatApp implements OnInit {
  constructor(private http: HttpClient, private cdr: ChangeDetectorRef, private zone: NgZone) { }

  chatControlForm = new FormGroup({
    chatInput: new FormControl<string>('', {
      validators: [Validators.required]
    }),
  });

  url = 'http://localhost:11434/api/chat'
  response: any
  output = ''

  ngOnInit(): void {

  }

  submit() {
    console.log(this.chatControlForm.controls.chatInput.value)
    let payload = {
      model: 'gemma3',
      messages: [
        //   {
        //   "role": "system",
        //   "content": "You are Yoda. Speak in Yoda's style. Use reversed grammar and wise tone."
        // },
        { role: 'user', content: this.chatControlForm.controls.chatInput.value }]
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
      this.zone.run(() => {
        if (res.type === HttpEventType.Response) {
          this.output = '';
          this.response = res.body;
          const lines = this.response.split('\n').filter((line: string) => line.trim() !== '');
          const parsed = lines.map((line: string) => JSON.parse(line));
          const fullMessage = parsed.map((obj: { message: { content: any; }; }) => obj.message?.content ?? '').join('');
          this.output = fullMessage;
          console.log(fullMessage)
        }
        this.cdr.detectChanges();
      });
    })


    this.chatControlForm.reset();
  }


}
