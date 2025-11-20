import { Scene } from 'phaser';
import { supabaseService, JobExperience } from '@/services/supabaseService';

export class VillageScene extends Scene {
    constructor() {
        super('VillageScene');
    }

    create() {
        const width = this.scale.width;
        const height = this.scale.height;

        // 1. Background (Village - Green/Grass)
        this.add.rectangle(width / 2, height / 2, width, height, 0x4CAF50).setOrigin(0.5);

        // Grass patches
        for (let i = 0; i < 20; i++) {
            const x = Phaser.Math.Between(0, width);
            const y = Phaser.Math.Between(0, height);
            this.add.circle(x, y, Phaser.Math.Between(20, 50), 0x228B22, 0.5);
        }

        // Title
        this.add.text(width / 2, 50, 'MY VILLAGE', {
            fontSize: '32px',
            color: '#FFFFFF',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Fetch and Spawn Experience NPCs
        this.loadExperiences();
    }

    private async loadExperiences() {
        const experiences = await supabaseService.fetchJobExperiences();

        experiences.forEach((exp: JobExperience) => {
            // Simple layout logic: scatter them or place in a grid
            // For now, random positions within bounds
            const x = Phaser.Math.Between(100, this.scale.width - 100);
            const y = Phaser.Math.Between(150, this.scale.height - 100);

            // Use job title or default
            const jobTitle = exp.jobs?.title || 'Unknown Job';

            // Random color for now
            const color = Phaser.Math.Between(0x000000, 0xFFFFFF);

            this.spawnExperienceNPC(x, y, jobTitle, color);
        });
    }

    spawnExperienceNPC(x: number, y: number, job: string, color: number) {
        const npc = this.add.rectangle(x, y, 32, 32, color);
        this.add.text(x, y - 30, job, { fontSize: '14px', color: '#FFF' }).setOrigin(0.5);

        // Simple tween to simulate "work"
        this.tweens.add({
            targets: npc,
            y: y - 10,
            duration: 500,
            yoyo: true,
            repeat: -1
        });
    }
}
