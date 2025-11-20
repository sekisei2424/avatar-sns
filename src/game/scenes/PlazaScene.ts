import { Scene } from 'phaser';
import { supabaseService, Post } from '@/services/supabaseService';

interface PostData {
    id: string;
    username: string;
    content: string;
    avatarColor: number;
    avatarPath: string;
}

export class PlazaScene extends Scene {
    private mapBackground!: Phaser.GameObjects.Image;
    private npcs: { sprite: Phaser.Physics.Arcade.Sprite, bubble: Phaser.GameObjects.Container }[] = [];

    // Mock data removed, using real data from Supabase

    constructor() {
        super('PlazaScene');
    }

    preload() {
        // Load assets
        if (!this.textures.exists('background')) {
            this.load.image('background', '/images/Square.png');
        }

        const avatars = [
            { key: 'avatar1', path: '/images/character_murabito_middle_man_blue.svg' },
            { key: 'avatar2', path: '/images/character_murabito_middle_woman_blue.svg' },
            { key: 'avatar3', path: '/images/character_murabito_senior_man_blue.svg' },
            { key: 'avatar4', path: '/images/character_murabito_young_man_blue.svg' }
        ];

        avatars.forEach(avatar => {
            if (!this.textures.exists(avatar.key)) {
                this.load.svg(avatar.key, avatar.path);
            }
        });
    }

    create() {
        const width = this.scale.width;
        const height = this.scale.height;

        // 1. Background Image
        this.mapBackground = this.add.image(width / 2, height / 2, 'background')
            .setOrigin(0.5);

        // Scale background to cover the screen (cover mode)
        this.updateBackgroundScale(width, height);

        // 2. Handle Resize
        this.scale.on('resize', (gameSize: Phaser.Structs.Size) => {
            if (this.cameras && this.cameras.main) {
                this.cameras.main.setViewport(0, 0, gameSize.width, gameSize.height);
                this.updateBackgroundScale(gameSize.width, gameSize.height);
            }
        });

        // 3. Fetch and Create NPCs from Supabase
        this.loadPosts();
    }

    private async loadPosts() {
        const posts = await supabaseService.fetchPosts();

        posts.forEach((post: Post) => {
            // Map Supabase data to scene format
            // Use a default avatar if none specified, or map based on some logic
            // For now, we'll just randomize or use a hash of the ID to pick one
            const mappedPost: PostData = {
                id: post.id,
                username: post.profiles?.username || 'Anonymous',
                content: post.content,
                avatarColor: 0xFFFFFF, // Not used with sprites
                avatarPath: '' // Handled in createNPC
            };
            this.createNPC(mappedPost);
        });
    }

    private updateBackgroundScale(width: number, height: number) {
        this.mapBackground.setPosition(width / 2, height / 2);
        const scaleX = width / this.mapBackground.width;
        const scaleY = height / this.mapBackground.height;
        const scale = Math.max(scaleX, scaleY);
        this.mapBackground.setScale(scale);
    }

    private createNPC(post: PostData) {
        const startX = Math.random() * this.scale.width;
        const startY = Math.random() * this.scale.height;

        // Randomly select an avatar
        const avatarIndex = Phaser.Math.Between(1, 4);
        const avatarKey = `avatar${avatarIndex}`;

        // Map key to path (simplified for now, ideally use a map or object)
        const avatarPaths: Record<string, string> = {
            'avatar1': '/images/character_murabito_middle_man_blue.svg',
            'avatar2': '/images/character_murabito_middle_woman_blue.svg',
            'avatar3': '/images/character_murabito_senior_man_blue.svg',
            'avatar4': '/images/character_murabito_young_man_blue.svg'
        };
        post.avatarPath = avatarPaths[avatarKey];

        const npc = this.physics.add.sprite(startX, startY, avatarKey);

        // Scale NPC (SVGs might be large, adjust as needed)
        npc.setScale(0.15);

        npc.setCollideWorldBounds(true);
        npc.setBounce(1);

        // Store post data on the NPC object
        (npc as any).postData = post;

        // Random movement
        const speed = 30;
        npc.setVelocity(
            (Math.random() - 0.5) * speed,
            (Math.random() - 0.5) * speed
        );

        // Click interaction
        npc.setInteractive();
        npc.on('pointerdown', () => {
            this.game.events.emit('open_post', post);
        });

        // Add Bubble (Thumbnail placeholder)
        const bubble = this.add.container(startX, startY - 70);

        // Bubble shape
        const bubbleBg = this.add.graphics();
        bubbleBg.fillStyle(0xFFFFFF, 0.9);
        bubbleBg.fillRoundedRect(-40, -30, 80, 60, 10);
        bubbleBg.lineStyle(2, 0x333333, 1);
        bubbleBg.strokeRoundedRect(-40, -30, 80, 60, 10);

        // Triangle pointer
        bubbleBg.fillTriangle(0, 35, -10, 30, 10, 30);
        bubbleBg.strokeTriangle(0, 35, -10, 30, 10, 30);

        // Text/Content (Truncated)
        const text = this.add.text(0, 0, post.content.substring(0, 10) + '...', {
            color: '#000',
            fontSize: '12px',
            align: 'center'
        }).setOrigin(0.5);

        bubble.add([bubbleBg, text]);

        this.npcs.push({ sprite: npc, bubble: bubble });
    }

    update() {
        this.npcs.forEach(({ sprite, bubble }) => {
            if (!sprite.body) return; // Safety check

            // Update bubble position to follow NPC
            bubble.setPosition(sprite.x, sprite.y - 70);

            // Randomly change direction occasionally
            if (Math.random() < 0.005) {
                const speed = 30;
                sprite.setVelocity(
                    (Math.random() - 0.5) * speed,
                    (Math.random() - 0.5) * speed
                );
            }

            // Stop occasionally
            if (Math.random() < 0.005) {
                sprite.setVelocity(0);
            }
        });
    }
}
