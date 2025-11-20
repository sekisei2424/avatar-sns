import { Scene } from 'phaser';
import { supabase } from '@/lib/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

export class MainScene extends Scene {
    private player!: Phaser.GameObjects.Rectangle;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private otherPlayers: { [key: string]: Phaser.GameObjects.Rectangle } = {};
    private channel!: RealtimeChannel;
    private myId: string | null = null;
    private jobBoardZone!: Phaser.GameObjects.Zone;

    private mapBackground!: Phaser.GameObjects.Rectangle;

    constructor() {
        super('MainScene');
    }

    preload() {
        // No assets to load for MVP, using primitives
    }

    async create() {
        const width = this.scale.width;
        const height = this.scale.height;

        // 1. Map (Green Rectangle) - Full Screen
        this.mapBackground = this.add.rectangle(width / 2, height / 2, width, height, 0x238126).setOrigin(0.5);

        // Handle Resize
        this.scale.on('resize', (gameSize: Phaser.Structs.Size) => {
            const { width, height } = gameSize;
            this.cameras.main.setViewport(0, 0, width, height);
            this.mapBackground.setPosition(width / 2, height / 2);
            this.mapBackground.setSize(width, height);
        });

        // 2. Job Board Area (Yellow Zone)
        const jobBoard = this.add.rectangle(700, 100, 100, 100, 0xFFFF00).setOrigin(0.5);
        this.add.text(700, 100, 'JOBS', { color: '#000' }).setOrigin(0.5);

        // Physics zone for interaction
        this.jobBoardZone = this.add.zone(700, 100, 100, 100);
        this.physics.add.existing(this.jobBoardZone, true);

        // 3. Player (Blue Square)
        // Start at random position
        const startX = Math.random() * 700 + 50;
        const startY = Math.random() * 500 + 50;

        this.player = this.add.rectangle(startX, startY, 32, 32, 0x0000FF);
        this.physics.add.existing(this.player);
        (this.player.body as Phaser.Physics.Arcade.Body).setCollideWorldBounds(true);

        // 4. Controls
        if (this.input.keyboard) {
            this.cursors = this.input.keyboard.createCursorKeys();
        }

        // 5. Supabase Setup
        const { data: { user } } = await supabase.auth.getUser();

        // For MVP, if no user, generate a random ID (or handle auth properly later)
        // Ideally we should wait for auth, but for now let's assume anonymous/temp ID if not logged in
        // or just use a random ID for the session if we want to test without auth first.
        // However, requirements say Supabase Auth.
        // Let's try to get a session, if not, maybe prompt login?
        // For the game logic, let's assume we have an ID.
        this.myId = user?.id || `guest_${Math.floor(Math.random() * 10000)}`;

        // Join Realtime Channel
        this.channel = supabase.channel('village_room');

        this.channel
            .on('broadcast', { event: 'player_move' }, (payload) => {
                this.handlePlayerMove(payload.payload);
            })
            .subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    // Broadcast initial position
                    await this.channel.send({
                        type: 'broadcast',
                        event: 'player_move',
                        payload: {
                            id: this.myId,
                            x: this.player.x,
                            y: this.player.y,
                        },
                    });
                }
            });

        // 6. Interaction Check
        this.physics.add.overlap(this.player, this.jobBoardZone, () => {
            // Emit event to React
            this.game.events.emit('open_job_board');
        });
    }

    update() {
        if (!this.cursors || !this.player) return;

        const speed = 200;
        const body = this.player.body as Phaser.Physics.Arcade.Body;

        body.setVelocity(0);

        let moved = false;

        if (this.cursors.left.isDown) {
            body.setVelocityX(-speed);
            moved = true;
        } else if (this.cursors.right.isDown) {
            body.setVelocityX(speed);
            moved = true;
        }

        if (this.cursors.up.isDown) {
            body.setVelocityY(-speed);
            moved = true;
        } else if (this.cursors.down.isDown) {
            body.setVelocityY(speed);
            moved = true;
        }

        if (moved && this.myId) {
            // Throttle updates in real app, but for MVP send every frame (or simple throttle)
            // Simple throttle: only send if position changed significantly or every N frames
            // For MVP, let's just send.
            this.channel.send({
                type: 'broadcast',
                event: 'player_move',
                payload: {
                    id: this.myId,
                    x: this.player.x,
                    y: this.player.y,
                },
            });
        }
    }

    private handlePlayerMove(payload: { id: string; x: number; y: number }) {
        if (payload.id === this.myId) return;

        if (!this.otherPlayers[payload.id]) {
            // Create new other player (Red Square)
            const other = this.add.rectangle(payload.x, payload.y, 32, 32, 0xFF0000);
            this.otherPlayers[payload.id] = other;
        } else {
            // Update position
            this.otherPlayers[payload.id].setPosition(payload.x, payload.y);
        }
    }
}
