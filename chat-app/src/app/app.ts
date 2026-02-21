import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CharacterSelection } from './character-selection/character-selection';
import { ChatApp } from './chat-app/chat-app';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, CharacterSelection, ChatApp],
  template: `
    <app-character-selection 
      *ngIf="!selectedCharacterId" 
      (onSelect)="selectCharacter($event)">
    </app-character-selection>
    
    <app-chat-app 
      *ngIf="selectedCharacterId" 
      [characterId]="selectedCharacterId"
      (onBack)="selectedCharacterId = null">
    </app-chat-app>
  `
})
export class App {
  selectedCharacterId: number | null = null;

  selectCharacter(id: number) {
    this.selectedCharacterId = id;
  }
}