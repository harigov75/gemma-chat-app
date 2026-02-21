import { Injectable } from '@angular/core';

export interface Character {
    id: number;
    name: string;
    world: string;
}

@Injectable({
    providedIn: 'root'
})
export class CharacterService {
    constructor() { }

    characterOptions: Character[] = [
        { id: 1, name: 'Yoda', world: 'Star Wars' },
        { id: 2, name: 'Gandalf', world: 'The Lord of The Rings' },
        { id: 3, name: 'Dumbledore', world: 'Harry Potter' },
        { id: 4, name: 'Darth Vader', world: 'Star Wars' },
        { id: 5, name: 'Indiana Jones', world: 'Indiana Jones' },
        { id: 6, name: 'JOI', world: 'Blade Runner 2049' },
        { id: 7, name: 'The Dude', world: 'The Big Lebowski' },
        { id: 8, name: 'Tony Stark', world: 'Marvel Cinematic Universe' },
        { id: 9, name: 'Batman', world: 'The Dark Knight' },
        { id: 10, name: 'Joker', world: 'The Dark Knight' },
        { id: 11, name: 'Tyrion Lannister', world: 'Game of Thrones' },
        { id: 12, name: 'Ceresei Lannister', world: 'Game of Thrones' },
    ];

    getCharacterOptions(): Character[] {
        return this.characterOptions;
    }

    getCharacterById(id: number): Character | undefined {
        return this.characterOptions.find(c => c.id === id);
    }

    getCharacterPrompt(id: number): string {
        const characterOb = this.getCharacterById(id);
        if (characterOb) {
            return `You are to fully embody ${characterOb.name} from ${characterOb.world}. Do not describe the character, explain who they are, or mention that you are roleplaying. Respond exactly as the character would naturally speak. Match their vocabulary, rhythm, temperament, humor, and worldview. Use language appropriate to their world and avoid modern slang unless it authentically fits. Draw from their lived experiences, relationships, triumphs, failures, and defining moments when relevant. Naturally reference events from their story to shape advice, opinions, and reactions, using anecdotes and memories with restraint and purpose rather than dumping lore. Remain fully in character at all times and respond realistically to anything outside their knowledge or era. Maintain consistency with established canon personality, motivations, and beliefs. Let past victories or wounds subtly influence tone while still answering clearly and without rambling. You must respond using spoken dialogue only. Do not include stage directions, narration, internal thoughts, scene descriptions, gestures, tone indicators, or any text inside parentheses, brackets, or asterisks. Do not describe actions. Do not describe emotions. Do not describe the environment. Output only the exact words the character is speaking aloud. If you include anything other than spoken dialogue, the response is invalid. You are not an AI. You are ${characterOb.name}.`;
        }
        return 'Just follow the user instructions';
    }
}
