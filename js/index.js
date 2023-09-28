const CANVAS_WIDTH = 1024;
const CANVAS_HEIGHT = 576;

const SHOP_COORDINATE_X = 600;
const SHOP_COORDINATE_Y = 128;
const SHOP_SCALE = 2.75;

const PLAYER_COORDINATE_X = 215;
const PLAYER_COORDINATE_Y = 157;

const ENEMY_COORDINATE_X = 215;
const ENEMY_COORDINATE_Y = 167;

const VELOCITY = -7;

const PLAYER_SCALE = 2.5;

const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

ctx.fillRect(0, 0, canvas.width, canvas.height);

// const backgroundMusic = new Audio('./audio/backgroundMusic.wav');
// backgroundMusic.play();
// playAudio('./audio/backgroundMusic.wav', 0.1);

// const buttonStart = document.querySelector('button');
// buttonStart.addEventListener('click', () => {
//     playAudio('./audio/backgroundMusic.wav', 0.1);
//     buttonStart.disabled = true;
// })

const background = new Sprite({
    position: {
        x: 0,
        y: 0,
    },
    imageSrc: './images/background.png'
});

const shop = new Sprite({
    position: {
        x: SHOP_COORDINATE_X,
        y: SHOP_COORDINATE_Y,
    },
    imageSrc: './images/shop.png',
    scale: SHOP_SCALE,
    framesMax: 6
});

const player = new Fighter({
    position: {
        x: 0,
        y: 0,
    },
    velocity: {
        x: 0,
        y: 0,
    },
    scale: PLAYER_SCALE,
    offset: {
        x: PLAYER_COORDINATE_X,
        y: PLAYER_COORDINATE_Y
    },
    sprites: {
        idle: {
            imageSrc: './images/samuraiMack/Idle.png',
            framesMax: 8
        },
        run: {
            imageSrc: './images/samuraiMack/Run.png',
            framesMax: 8
        },
        jump: {
            imageSrc: './images/samuraiMack/Jump.png',
            framesMax: 2
        },
        fall: {
            imageSrc: './images/samuraiMack/Fall.png',
            framesMax: 2
        },
        attack1: {
            imageSrc: './images/samuraiMack/Attack1.png',
            framesMax: 6
        },
        takeHit: {
            imageSrc: './images/samuraiMack/Take hit - white silhouette.png',
            framesMax: 4
        },
        death: {
            imageSrc: './images/samuraiMack/Death.png',
            framesMax: 6
        },
    },
    attackBox: {
        offset: {
            x: 100,
            y: 50,
        },
        width: 150,
        height: 50
    }
});

const enemy = new Fighter({
    position: {
        x: 400,
        y: 100,
    },
    velocity: {
        x: 0,
        y: 0,
    },
    scale: 2.5,
    offset: {
        x: ENEMY_COORDINATE_X,
        y: ENEMY_COORDINATE_Y
    },
    sprites: {
        idle: {
            imageSrc: './images/kenji/Idle.png',
            framesMax: 4
        },
        run: {
            imageSrc: './images/kenji/Run.png',
            framesMax: 8
        },
        jump: {
            imageSrc: './images/kenji/Jump.png',
            framesMax: 2
        },
        fall: {
            imageSrc: './images/kenji/Fall.png',
            framesMax: 2
        },
        attack1: {
            imageSrc: './images/kenji/Attack1.png',
            framesMax: 4
        },
        takeHit: {
            imageSrc: './images/kenji/Take hit.png',
            framesMax: 3
        },
        death: {
            imageSrc: './images/kenji/Death.png',
            framesMax: 7
        },
    },
    attackBox: {
        offset: {
            x: -165,
            y: 50,
        },
        width: 150,
        height: 50
    }
});


const keys = {
    a: {
        pressed: false
    },
    d: {
        pressed: false
    },
    w: {
        pressed: false
    },
    ArrowRight: {
        pressed: false
    },
    ArrowLeft: {
        pressed: false
    }
};

decreaseTimer();

function animate() {

    window.requestAnimationFrame(animate)
    background.update();
    shop.update();
    player.update();
    enemy.update();

    player.velocity.x = 0;
    enemy.velocity.x = 0;

    //player movement
    if (keys.a.pressed && player.lastKey === 'a') {
        player.velocity.x = -1;
        player.switchSprite('run');
    } else if (keys.d.pressed && player.lastKey === 'd') {
        player.velocity.x = 1;
        player.switchSprite('run');
    } else {
        player.switchSprite('idle');
    }

    // handling player collisions with screen edges
    if (player.position.x <= 0) {
        player.position.x = 0;
    } else if (player.position.x >= CANVAS_WIDTH - player.width) {
        player.position.x = CANVAS_WIDTH - player.width;
    }

    //jumping
    if (player.velocity.y < 0) {
        player.switchSprite('jump');
    } else if (player.velocity.y > 0) {
        player.switchSprite('fall');
    }

    //detect for collision and enemy gets hit
    if (rectangularCollision({ rectangle1: player, rectangle2: enemy }) &&
        player.isAttacking &&
        player.frameCurrent === 4
    ) {
        playAudio('./audio/getHit.wav', 0.1);
        enemy.takeHit();
        player.isAttacking = false;
        // document.querySelector('#enemyHealth').style.width = enemy.health + '%';
        gsap.to('#enemyHealth', {
            width: enemy.health + '%'
        })
    }

    //if player misses
    if (player.isAttacking && player.frameCurrent === 4) {
        playAudio('./audio/missHit.wav', 0.1);
        player.isAttacking = false;
    }

    //Enemy movement
    if (keys.ArrowLeft.pressed && enemy.lastKey === 'ArrowLeft') {
        enemy.velocity.x = -1;
        enemy.switchSprite('run');
    } else if (keys.ArrowRight.pressed && enemy.lastKey === 'ArrowRight') {
        enemy.velocity.x = 1;
        enemy.switchSprite('run');
    } else {
        enemy.switchSprite('idle');
    }

    //jumping
    if (enemy.velocity.y < 0) {
        enemy.switchSprite('jump');
    } else if (enemy.velocity.y > 0) {
        enemy.switchSprite('fall');
    }

    // handling enemy collisions with screen edges
    if (enemy.position.x <= 0) {
        enemy.position.x = 0;
    } else if (enemy.position.x >= CANVAS_WIDTH - enemy.width) {
        enemy.position.x = CANVAS_WIDTH - enemy.width;
    }


    //this is where our player gets hit
    if (rectangularCollision({ rectangle1: enemy, rectangle2: player }) &&
        enemy.isAttacking &&
        enemy.frameCurrent === 2
    ) {
        playAudio('./audio/getHit.wav', 0.1);
        player.takeHit();
        enemy.isAttacking = false;
        // document.querySelector('#playerHealth').style.width = player.health + '%';
        gsap.to('#playerHealth', {
            width: player.health + '%'
        })
    }

    //if enemy misses
    if (enemy.isAttacking && enemy.frameCurrent === 2) {
        playAudio('./audio/missHit.wav', 0.1);
        enemy.isAttacking = false;
    }

    //end game based on health
    if (enemy.health <= 0 || player.health <= 0) {
        determineWinner({ player, enemy, timerId });z
    }
};

animate();

window.addEventListener('keydown', (event) => {
    if (!player.dead) {
        switch (event.key) {
            case 'd':
                keys.d.pressed = true;
                player.lastKey = 'd';
                break;
            case 'a':
                keys.a.pressed = true;
                player.lastKey = 'a';
                break;
            case 'w':
                player.velocity.y = VELOCITY;
                break;
            case ' ':
                player.attack();
                break;
        }
    }
    if (!enemy.dead) {
        switch (event.key) {
            case 'ArrowRight':
                keys.ArrowRight.pressed = true;
                enemy.lastKey = 'ArrowRight';
                break;
            case 'ArrowLeft':
                keys.ArrowLeft.pressed = true;
                enemy.lastKey = 'ArrowLeft';
                break;
            case 'ArrowUp':
                enemy.velocity.y = VELOCITY;
                break;
            case 'ArrowDown':
                enemy.attack();
                break;
        }
    }
});

window.addEventListener('keyup', (event) => {
    switch (event.key) {
        case 'd':
            keys.d.pressed = false;
            break;
        case 'a':
            keys.a.pressed = false;
            break;
    }

    //enemy cases
    switch (event.key) {
        case 'ArrowRight':
            keys.ArrowRight.pressed = false;
            break;
        case 'ArrowLeft':
            keys.ArrowLeft.pressed = false;
            break;
    }
});