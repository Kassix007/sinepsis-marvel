import { Scene } from "phaser";

export class GameOverScene extends Scene {
	end_points = 0;
	end_time = "0:00";
	constructor() {
		super("GameOverScene");
	}

	init(data) {
		this.cameras.main.fadeIn(1000, 0, 0, 0);
		this.end_points = data.points || 0;
		this.end_time = data.time || "0:00";
	}

	create() {
		// Backgrounds
		this.add.image(0, 0, "background")
			.setOrigin(0, 0);
		this.add.image(0, this.scale.height, "floor")
			.setOrigin(0, 1);

		// Rectangles to show the text
		// Background rectangles
		this.add.rectangle(
			0,
			this.scale.height / 2,
			this.scale.width,
			120,
			0xffffff
		).setAlpha(.8).setOrigin(0, 0.5);
		this.add.rectangle(
			0,
			this.scale.height / 2 + 105,
			this.scale.width,
			90,
			0x000000
		).setAlpha(.8).setOrigin(0, 0.5);

		const gameover_text = this.add.bitmapText(
			this.scale.width / 2,
			this.scale.height / 2,
			"knighthawks",
			"GAME\nOVER",
			62,
			1
		)
		gameover_text.setOrigin(0.5, 0.5);
		gameover_text.postFX.addShine();

		this.add.bitmapText(
			this.scale.width / 2,
			this.scale.height / 2 + 85,
			"pixelfont",
			`YOUR POINTS: ${this.end_points}`,
			24
		).setOrigin(0.5, 0.5);

		// Click to restart
		this.time.addEvent({
			delay: 1000,
			callback: () => {
				this.input.on("pointerdown", () => {
					this.scene.start("MainScene");
				});
			}

		})

		console.log(`[GameOver] Points: ${this.end_points}, Time: ${this.end_time}`);

		const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImpvaG5AMTguY29tIiwiZXhwIjoxNzU2Njg3MDA4LCJ1c2VyX2lkIjoiZDBlNDM0MzgtY2FkNS00N2NhLTg1ZGEtNzQ5ODRjMzA2ZTVlIn0.28FGamwLo8HNvxS9YnsO5qofenBHHvrKE_9hPYLzDM0"; // or wherever you store JWT
		fetch("http://localhost:8080/api/gamestats", {
			method: "POST",
			headers: {
				"Authorization": `Bearer ${token}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				best_time: this.end_time,
				best_points: this.end_points.toString(),
			}),
		})
			.then(res => res.json())
			.then(data => {
				console.log("[GameOver] API response:", data);
				setTimeout(() => {
					window.location.href = "http://localhost:3000/game";
				}, 2000);
			})
			.catch(err => console.error("[GameOver] Failed to save stats:", err));
	}
}
