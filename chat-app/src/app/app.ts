import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatApp } from './chat-app/chat-app';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ChatApp],
  template: `
    <app-chat-app 
      [characterId]="selectedCharacterId">
    </app-chat-app>
  `
})
export class App {
  selectedCharacterId: number = 1;
}