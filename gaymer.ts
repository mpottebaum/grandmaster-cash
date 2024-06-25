import Phaser from 'phaser'

var config = {
	type: Phaser.AUTO,
	width: 800,
	height: 600,
	physics: {
		default: 'arcade',
		arcade: {
			gravity: { y: 300 },
			debug: false
		}
	},
	scene: {
		preload: preload,
		create: create,
		update: update
	}
};

let player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
var stars;
var bombs;
var platforms;
var cursors;
var score = 0;
var gameOver = false;
var scoreText;

let keyA, keyS, keyD, keyW;

var game = new Phaser.Game(config);

function preload() {
	this.load.image('sky', 'assets/sky.png');
	this.load.image('ground', 'assets/platform.png');
	this.load.image('star', 'assets/star.png');
	this.load.image('bomb', 'assets/bomb.png');
	this.load.spritesheet('gmc', 'assets/gmc-cat.png', { frameWidth: 30, frameHeight: 30, });
}

function create() {
	//  A simple background for our game
	this.add.image(400, 300, 'sky');

	//  The platforms group contains the ground and the 2 ledges we can jump on
	platforms = this.physics.add.staticGroup();

	//  Here we create the ground.
	//  Scale it to fit the width of the game (the original sprite is 400x32 in size)
	platforms.create(400, 568, 'ground').setScale(2).refreshBody();

	//  Now let's create some ledges
	platforms.create(600, 400, 'ground');
	platforms.create(50, 250, 'ground');
	platforms.create(750, 220, 'ground');

	// The player and its settings
	player = this.physics.add.sprite(100, 450, 'gmc');

	//  Player physics properties. Give the little guy a slight bounce.
	player.setBounce(0.2);
	player.setCollideWorldBounds(true);

	//  Our player animations, turning, walking left and walking right.
	this.anims.create({
		key: 'left',
		frames: this.anims.generateFrameNumbers('gmc', { start: 35, end: 36 }),
		frameRate: 10,
		repeat: -1
	});

	this.anims.create({
		key: 'idle right',
		frames: [{ key: 'gmc', frame: 0 }],
		frameRate: 20
	});

	this.anims.create({
		key: 'idle left',
		frames: [{ key: 'gmc', frame: 39 }],
		frameRate: 20
	});

	this.anims.create({
		key: 'right',
		frames: this.anims.generateFrameNumbers('gmc', { start: 3, end: 4, }),
		frameRate: 10,
		repeat: -1
	});

	this.anims.create({
		key: 'left jab RIGHT',
		frames: this.anims.generateFrameNumbers('gmc', { start: 26, end: 27, }),
		frameRate: 6,
		repeat: -1,
	})

	this.anims.create({
		key: 'right jab RIGHT',
		frames: this.anims.generateFrameNumbers('gmc', { start: 28, end: 29, }),
		frameRate: 6,
		repeat: -1,
	})

	this.anims.create({
		key: 'left jab LEFT',
		frames: this.anims.generateFrameNumbers('gmc', { start: 52, end: 53, }),
		frameRate: 6,
		repeat: -1,
	})

	this.anims.create({
		key: 'right jab LEFT',
		frames: this.anims.generateFrameNumbers('gmc', { start: 50, end: 51, }),
		frameRate: 6,
		repeat: -1,
	})

	//  Input Events
	cursors = this.input.keyboard.createCursorKeys();

	keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A)
	keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S)
	keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
	keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W)

	//  Some stars to collect, 12 in total, evenly spaced 70 pixels apart along the x axis
	stars = this.physics.add.group({
		key: 'star',
		repeat: 11,
		setXY: { x: 12, y: 0, stepX: 70 }
	});

	stars.children.iterate(function(child) {

		//  Give each star a slightly different bounce
		child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));

	});

	bombs = this.physics.add.group();

	//  The score
	scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });

	//  Collide the player and the stars with the platforms
	this.physics.add.collider(player, platforms);
	this.physics.add.collider(stars, platforms);
	this.physics.add.collider(bombs, platforms);

	//  Checks to see if the player overlaps with any of the stars, if he does call the collectStar function
	this.physics.add.overlap(player, stars, collectStar, null, this);

	this.physics.add.collider(player, bombs, hitBomb, null, this);
}

let isPlayerFacingLeft = false;
let isJabLeft = true;

function update() {
	if (gameOver) {
		return;
	}

	if (cursors.left.isDown) {
		player.setVelocityX(-160);

		player.anims.play('left', true);
		isPlayerFacingLeft = true;
	}
	else if (cursors.right.isDown) {
		player.setVelocityX(160);

		player.anims.play('right', true);
		isPlayerFacingLeft = false;
	}
	else {
		player.setVelocityX(0);

		if (isPlayerFacingLeft) player.anims.play('idle left');
		else player.anims.play('idle right');
	}

	if (cursors.up.isDown && player.body.touching.down) {
		player.setVelocityY(-330);
	}

	if (keyA.isDown) {
		console.log('key a bruh')
	}
	if (keyS.isDown) {
		console.log('key s bruh')
	}
	if (keyD.isDown) {
		console.log('key d bruh')
	}
	if (keyW.isDown) {
		const playerDirection = isPlayerFacingLeft ? 'LEFT' : 'RIGHT';
		if (isJabLeft) {
			player.anims.play('left jab ' + playerDirection)
			isJabLeft = false
		} else {
			player.anims.play('right jab ' + playerDirection)
			isJabLeft = true
		}
	}
}

function collectStar(player, star) {
	star.disableBody(true, true);

	//  Add and update the score
	score += 10;
	scoreText.setText('Score: ' + score);

	if (stars.countActive(true) === 0) {
		//  A new batch of stars to collect
		stars.children.iterate(function(child) {

			child.enableBody(true, child.x, 0, true, true);

		});

		var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);

		var bomb = bombs.create(x, 16, 'bomb');
		bomb.setBounce(1);
		bomb.setCollideWorldBounds(true);
		bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
		bomb.allowGravity = false;

	}
}

function hitBomb(player, bomb) {
	this.physics.pause();

	player.setTint(0xff0000);

	player.anims.play('turn');

	gameOver = true;
}

