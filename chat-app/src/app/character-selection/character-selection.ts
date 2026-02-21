import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { CharacterService, Character } from '../services/character.service';

@Component({
    selector: 'app-character-selection',
    standalone: true,
    imports: [CommonModule, MatButtonModule],
    template: `
    <div class="selection-container">
      <h1 class="title">Choose Your Character</h1>
      <div class="character-grid">
        <button 
          mat-flat-button 
          color="accent" 
          *ngFor="let char of characters" 
          (click)="selectCharacter(char.id)"
          class="character-btn">
          <span class="char-name">{{ char.name }}</span>
          <span class="char-world">{{ char.world }}</span>
        </button>
      </div>
    </div>
  `,
    styles: [`
    .selection-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px;
      min-height: 100vh;
      background-color: #121212;
      color: yellow;
      font-family: 'Roboto', sans-serif;
    }

    .title {
      font-size: 2.5rem;
      margin-bottom: 40px;
      text-transform: uppercase;
      letter-spacing: 2px;
      text-shadow: 0 0 10px rgba(255, 255, 0, 0.3);
    }

    .character-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 20px;
      width: 100%;
      max-width: 1000px;
    }

    .character-btn {
      height: 100px !important;
      background-color: transparent !important;
      border: 2px solid yellow !important;
      color: yellow !important;
      border-radius: 12px !important;
      transition: all 0.3s ease !important;
      display: flex !important;
      flex-direction: column !important;
      justify-content: center !important;
      align-items: center !important;
      padding: 15px !important;
    }

    .character-btn:hover {
      background-color: yellow !important;
      color: black !important;
      transform: translateY(-5px);
      box-shadow: 0 5px 15px rgba(255, 255, 0, 0.4);
    }

    .char-name {
      font-size: 1.2rem;
      font-weight: bold;
      display: block;
      margin-bottom: 5px;
    }

    .char-world {
      font-size: 0.8rem;
      opacity: 0.8;
      display: block;
      text-transform: italic;
    }

    @media (max-width: 600px) {
      .title {
        font-size: 1.8rem;
      }
      .character-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class CharacterSelection implements OnInit {
    characters: Character[] = [];

    @Output() onSelect = new EventEmitter<number>();

    constructor(private characterService: CharacterService) { }

    ngOnInit(): void {
        this.characters = this.characterService.getCharacterOptions();
    }

    selectCharacter(id: number): void {
        this.onSelect.emit(id);
    }
}
