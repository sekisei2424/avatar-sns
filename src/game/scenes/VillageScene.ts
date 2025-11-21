import { Scene } from 'phaser';
import { supabaseService } from '@/services/supabaseService';

export class VillageScene extends Scene {
    private player!: Phaser.Physics.Arcade.Sprite;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private isMoving: boolean = false;
    private targetPosition: { x: number, y: number } | null = null;
    private onReachTarget: (() => void) | null = null;

    constructor() {
        super('VillageScene');
    }

    preload() {
        // Load assets
        if (!this.textures.exists('background_village')) {
            this.load.image('background_village', '/images/Square.png'); // Reuse square for now or placeholder
        }

        // Load avatars if not already loaded (PlazaScene might have loaded them, but good to be safe)
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

        // 1. Background
        // Use a green tint to distinguish from Plaza
        const bg = this.add.image(width / 2, height / 2, 'background_village')
            .setOrigin(0.5)
            .setTint(0xccffcc);

        // Scale background
        const scaleX = width / bg.width;
        const scaleY = height / bg.height;
        const scale = Math.max(scaleX, scaleY);
        bg.setScale(scale);

        // 2. Create Houses (Menu Items)
        this.createHouse(width * 0.2, height * 0.3, 0xFF9999, 'Profile', '/profile');
        this.createHouse(width * 0.8, height * 0.3, 0x9999FF, 'Search', '/search');
        this.createHouse(width * 0.2, height * 0.7, 0xFFFF99, 'Messages', '/messages'); // Placeholder route
        this.createHouse(width * 0.8, height * 0.7, 0x99FF99, 'Plaza', '/');

        // 3. Create Player Avatar
        // For now, use a default or random one. Ideally fetch from user profile.
        // We can try to get the user from localStorage or just random for now since we are client-side.
        // In a real app, we'd pass the user data to the scene init.
        const avatarKey = 'avatar1';
        this.player = this.physics.add.sprite(width / 2, height / 2, avatarKey);
        this.player.setScale(0.15);
        this.player.setCollideWorldBounds(true);

        // 4. Input Handling
        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            // Move to clicked position (unless clicking a house, which is handled by house interaction)
            // But actually, we want to walk to the house when clicked.
            // So we'll handle movement in the house click handler or here if just walking.
            this.moveTo(pointer.x, pointer.y);
        });
    }

    private createHouse(x: number, y: number, color: number, label: string, url: string) {
        const houseGroup = this.add.container(x, y);

        // House Graphics (Placeholder)
        const graphics = this.add.graphics();
        graphics.fillStyle(color, 1);

        // Body
        graphics.fillRect(-40, -30, 80, 60);
        // Roof
        graphics.fillStyle(0x888888, 1);
        graphics.fillTriangle(-50, -30, 50, -30, 0, -70);

        // Door
        graphics.fillStyle(0x663300, 1);
        graphics.fillRect(-15, 0, 30, 30);

        houseGroup.add(graphics);

        // Label
        const text = this.add.text(0, 40, label, {
            fontSize: '16px',
            color: '#000',
            fontStyle: 'bold',
            backgroundColor: '#FFF',
            padding: { x: 4, y: 2 }
        }).setOrigin(0.5);
        houseGroup.add(text);

        // Interaction
        const hitArea = new Phaser.Geom.Rectangle(-50, -70, 100, 110);
        houseGroup.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);

        houseGroup.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            pointer.event.stopPropagation(); // Prevent scene click

            // Walk to house then navigate
            this.moveTo(x, y + 50, () => { // Stop slightly below the house
                window.location.href = url;
            });
        });
    }

    private moveTo(x: number, y: number, onComplete?: () => void) {
        this.targetPosition = { x, y };
        this.onReachTarget = onComplete || null;
        this.isMoving = true;

        // Calculate velocity
        const speed = 200;
        const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, x, y);
        const velocityX = Math.cos(angle) * speed;
        const velocityY = Math.sin(angle) * speed;

        this.player.setVelocity(velocityX, velocityY);
    }

    update() {
        if (this.isMoving && this.targetPosition) {
            const distance = Phaser.Math.Distance.Between(
                this.player.x,
                this.player.y,
                this.targetPosition.x,
                this.targetPosition.y
            );

            // Stop if close enough
            if (distance < 10) {
                this.player.setVelocity(0);
                this.isMoving = false;
                this.targetPosition = null;

                if (this.onReachTarget) {
                    this.onReachTarget();
                    this.onReachTarget = null;
                }
            }
        }
    }
}
