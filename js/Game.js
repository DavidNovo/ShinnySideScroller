var BasicGame = BasicGame || {};

BasicGame.Game = function () {

    //  When a State is added to Phaser it automatically has the following 
    // properties set on it, even if they already exist:

    this.game; //  a reference to the currently running game (Phaser.Game)
    this.add; //  used to add sprites, text, groups, etc (Phaser.GameObjectFactory)
    this.camera; //  a reference to the game camera (Phaser.Camera)
    this.cache; //  the game cache (Phaser.Cache)
    this.input; //  the global input manager. You can access this.input.keyboard, this.input.mouse, as well from it. (Phaser.Input)
    this.load; //  for preloading assets (Phaser.Loader)
    this.math; //  lots of useful common math operations (Phaser.Math)
    this.sound; //  the sound manager - add a sound, play one, set-up markers, etc (Phaser.SoundManager)
    this.stage; //  the game stage (Phaser.Stage)
    this.time; //  the clock (Phaser.Time)
    this.tweens; //  the tween manager (Phaser.TweenManager)
    this.state; //  the state manager (Phaser.StateManager)
    this.world; //  the game world (Phaser.World)
    this.particles; //  the particle manager (Phaser.Particles)
    this.physics; //  the physics manager (Phaser.Physics)
    this.rnd; //  the repeatable random number generator (Phaser.RandomDataGenerator)

    //  You can use any of these from any function within this State.
    //  But do consider them as being 'reserved words', i.e. don't create a property for your own game called "world" or you'll over-write the world reference.

};

BasicGame.Game.prototype = {

    preload: function () {
        this.game.time.advancedTiming = true;
    },

    create: function () {

        // sounds
        this.barkSound = this.game.add.audio('bark');
        this.whineSound = this.game.add.audio('whine');

        // variables used for the game state
        this.scratches = 0;
        this.wraps = 0;
        this.points = 0;
        this.wrapping = true;
        this.stopped = false;
        this.maxScratches = 5;

        // create array for toys that can be gathered from the mounds
        var bone = this.game.add.sprite(0, this.game.height - 130, 'bone');
        var ball = this.game.add.sprite(0, this.game.height - 130, 'ball');
        bone.visible = false;
        ball.visible = false;
        this.toys = [bone, ball];
        this.currentToy = bone;

        // display the stats of the player
        var style1 = {
            font: "20px Arial",
            fill: "#ff0"
        };
        var t1 = this.game.add.text(10, 20, "Points:", style1);
        var t2 = this.game.add.text(this.game.width - 300, 20, "Remaining Flea Scratches:", style1);
        t1.fixedToCamera = true;
        t2.fixedToCamera = true;

        var style2 = {
            font: "26px Arial",
            fill: "#00ff00"
        };
        this.pointsText = this.game.add.text(80, 18, "", style2);
        this.fleasText = this.game.add.text(this.game.width - 50, 18, "", style2);
        this.refreshStats();
        this.pointsText.fixedToCamera = true;
        this.fleasText.fixedToCamera = true;


        //  Honestly, just about anything could go here. It's YOUR game after all. Eat your heart out!

        //set up background and ground layer
        this.game.world.setBounds(0, 0, 3500, this.game.height);
        this.grass = this.add.tileSprite(0, this.game.height - 100, this.game.world.width, 70, 'grass');
        this.ground = this.add.tileSprite(0, this.game.height - 70, this.game.world.width, 70, 'ground');

        //create player and walk animation
        this.player = this.game.add.sprite(this.game.width / 2, this.game.height - 90, 'dog');
        this.player.animations.add('walk');

        //create the fleas
        this.generateFleas();
        //and the toy mounds
        this.generateMounds();

        //put everything in the correct order (the grass will be camoflauge),
        //but the toy mounds have to be above that to be seen, but behind the
        //ground so they barely stick up
        this.game.world.bringToTop(this.grass);
        this.game.world.bringToTop(this.mounds);
        this.game.world.bringToTop(this.ground);


        //enable physics on the player and ground
        this.game.physics.arcade.enable(this.player);
        this.game.physics.arcade.enable(this.ground);

        //player gravity
        this.player.body.gravity.y = 1000;

        //so player can walk on ground
        this.ground.body.immovable = true;
        this.ground.body.allowGravity = false;

        //properties when the player is digging, scratching and standing, so we can use in update()
        var playerDigImg = this.game.cache.getImage('playerDig');
        this.player.animations.add('dig');
        this.player.digDimensions = {
            width: playerDigImg.width,
            height: playerDigImg.height
        };

        var playerScratchImg = this.game.cache.getImage('playerScratch');
        this.player.animations.add('scratch');
        this.player.scratchDimensions = {
            width: playerScratchImg.width ,
            height: playerScratchImg.height
        };

        this.player.standDimensions = {
            width: this.player.width,
            height: this.player.height
        };
        this.player.anchor.setTo(0.5, 1);

        //the camera will follow the player in the world
        this.game.camera.follow(this.player);

        //play the walking animation
        this.player.animations.play('walk', 3, true);

        //move player with cursor keys
        this.cursors = this.game.input.keyboard.createCursorKeys();

        //...or by swiping
        this.swipe = this.game.input.activePointer;
    },

    update: function () {
        //  Honestly, just about anything could go here. It's YOUR game after all. 
        // Eat your heart out!

        // player land on ground instead of falling through
        this.game.physics.arcade.collide(this.player, this.ground, this.playerHit, null, this);
        // player bitten by a flea
        this.game.physics.arcade.collide(this.player, this.fleas, this.playerBit, null, this);
        // player can overlap with dirt mounds
        this.game.physics.arcade.overlap(this.player, this.mounds, this.collect, this.checkDig, this);


        //only respond to keys and keep the speed if the player is alive
        if (this.player.alive && !this.stopped) {

            this.player.body.velocity.x = 250;
            //We do a little math to determine whether the game world has wrapped around.
            //If so, we want to destroy everything and regenerate, so the game will remain random
            if (!this.wrapping && this.player.x < this.game.width) {
                //Not used yet, but may be useful to know how many times we've wrapped
                this.wraps++;

                // once we wrap we want to destroy everything and regenerate the world
                this.wrapping = true;
                this.fleas.destroy();
                this.generateFleas();
                this.mounds.destroy();
                this.generateMounds();
                // then put things back in the correct order
                this.game.world.bringToTop(this.grass);
                this.game.world.bringToTop(this.mounds);
                this.game.world.bringToTop(this.ground);
            } else if (this.player.x >= this.game.width) {
                this.wrapping = false;
            }


            //take the appropriate action for swiping up or pressing up arrow on keyboard
            //we don't wait until the swipe is finished (this.swipe.isUp),
            //  because of latency problems (it takes too long to jump before hitting a flea)
            if (this.swipe.isDown && (this.swipe.positionDown.y > this.swipe.position.y)) {
                this.playerJump();
            } else if (this.cursors.up.isDown) {
                this.playerJump();
            }

            //The game world is infinite in the x-direction, so we wrap around.
            //We subtract padding so the player will remain in the middle of the screen when
            //wrapping, rather than going to the end of the screen first.
            this.game.world.wrap(this.player, -(this.game.width / 2), false, true, false);

        }

    },

    render: function () {
        //game.debug.body(sprite);
        this.game.debug.text(this.game.time.fps || '--', 20, 70, "#00ff00", "40px Courier");
    },

    generateMounds: function () {
        this.mounds = this.game.add.group();

        //enable physics in them
        this.mounds.enableBody = true;

        //phaser's random number generator
        var numMounds = this.game.rnd.integerInRange(0, 5)
        var mound;

        for (var i = 0; i < numMounds; i++) {
            //  add sprite within an area excluding the beginning and ending
            //  of the game world so items won't suddenly appear or disappear when wrapping
            var x = this.game.rnd.integerInRange(this.game.width, this.game.world.width - this.game.width);
            mound = this.mounds.create(x, this.game.height - 75, 'mound');
            mound.body.velocity.x = 0;
        }
    },

    generateFleas: function () {
        this.fleas = this.game.add.group();

        //enable physics in them
        this.fleas.enableBody = true;

        //phaser's random number generator
        var numFleas = this.game.rnd.integerInRange(1, 5)
        var flea;

        for (var i = 0; i < numFleas; i++) {
            //add sprite within an area excluding the beginning and ending
            //  of the game world so items won't suddenly appear or disappear when wrapping
            var x = this.game.rnd.integerInRange(this.game.width, this.game.world.width - this.game.width);
            flea = this.fleas.create(x, this.game.height - 115, 'flea');

            //physics properties
            flea.body.velocity.x = this.game.rnd.integerInRange(-20, 0);

            flea.body.immovable = true;
            flea.body.collideWorldBounds = false;
        }
    },
    playerJump: function () {
        //when the ground is a sprite, we need to test for "touching" instead of "blocked"
        if (this.player.body.touching.down) {
            this.player.body.velocity.y -= 700;
        }
    },

    checkDig: function () {
        if (this.cursors.down.isDown || (this.swipe.isDown && (this.swipe.position.y > this.swipe.positionDown.y))) {
            return true;
        } else {
            return false;
        }
    },
    collect: function (player, mound) {
        //this is called continuously while player is on mound, but we only want to do it once
        if (!this.stopped) {
            //change image and update the body size for the physics engine
            this.player.loadTexture('playerDig');
            this.player.animations.play('dig', 10, true);
            this.player.body.setSize(this.player.digDimensions.width, this.player.digDimensions.height);

            //we can't remove the toy mound until digging is finished, so we have to set a variable for
            //the function called from the timer (below)
            this.currentMound = mound;

            //we stop a couple of seconds for the dig animation to play
            this.stopped = true;
            this.player.body.velocity.x = 0;
            this.game.time.events.add(Phaser.Timer.SECOND * 2, this.playerDig, this);
        }
    },
    playerDig: function () {
        //play audio
        this.barkSound.play();

        //grab the location before we destroy the toy mound so we can place the toy
        var x = this.currentMound.x;

        //remove toy the mound sprite now that the toy is collected
        this.currentMound.destroy();

        //refresh our points stats
        this.points += 5;
        this.refreshStats();

        //randomly pull a toy from the array
        this.currentToy = this.toys[Math.floor(Math.random() * this.toys.length)];

        //make the toy visible where the mound used to be
        this.currentToy.visible = true;
        this.currentToy.x = x;

        //and make it disappear again after one second
        this.game.time.events.add(Phaser.Timer.SECOND, this.currentToyInvisible, this);

        //We switch back to the standing version of the player
        this.player.loadTexture('dog');
        this.player.animations.play('walk', 3, true);
        this.player.body.setSize(this.player.standDimensions.width, this.player.standDimensions.height);
        this.player.anchor.setTo(0.5, 1.0);
        this.stopped = false;
    },
    currentToyInvisible: function () {
        this.currentToy.visible = false;
    },
    playerBit: function (player, flea) {
        //remove the flea that bit our player so it is no longer in the way
        flea.destroy();

        //update our stats
        this.scratches++;
        this.refreshStats();

        //change sprite image
        this.player.loadTexture('playerScratch');
        this.player.animations.play('scratch', 10, true);

        //play whine audio
        this.whineSound.play();

        //wait a couple of seconds for the scratch animation to play before continuing
        this.stopped = true;
        // my fix, ths following line was causeing the problem
        // it was set to (0.5, 1.1) which caused the player
        // to sink below the colission line of the ground.
        this.player.anchor.setTo(0.5, 1.0);
        this.player.body.velocity.x = 0;
        this.game.time.events.add(Phaser.Timer.SECOND * 2, this.playerScratch, this);
    },
    refreshStats: function () {
        this.pointsText.text = this.points;
        this.fleasText.text = this.maxScratches - this.scratches;
    },

    playerHit: function (player, blockedLayer) {
        if (player.body.touching.right) {
            //can add other functionality here for extra obstacles later
        }
    },
    playerScratch: function () {
        this.stopped = false;

        // check the number of scratches, if 5 or greater
        // the player dies
        if (this.scratches >= 5) {
            this.player.alive = false;

            // reset world,
            this.fleas.destroy();
            this.mounds.destroy();

            this.player.anchor.setTo(0.5, 1.1);
            this.player.loadTexture('dog');
            this.player.animations.play('walk', 10, true);
            this.player.body.setSize(this.player.standDimensions.width, this.player.standDimensions.height);

            //.. then run home
            this.player.scale.x = -1;
            this.player.body.velocity.x = -1000;

            // run off the screen
            this.game.camera.unfollow();

            //..then go to Game Over state
            this.game.time.events.add(15000, this.gameOver, this);

        } else {
            console.log("in the playerScratch function!!!!!!!!!");
            this.player.anchor.setTo(0.5, 1.1);
            this.player.loadTexture('dog');
            this.player.animations.play('walk', 3, true);
            this.player.body.setSize(this.player.standDimensions.width, this.player.standDimensions.height);
 
        }
    },


    quitGame: function (pointer) {

        //  Here you should destroy anything you no longer need.
        //  Stop music, delete sprites, purge caches, free resources, all that good stuff.

        //  Then let's go back to the main menu.
        this.state.start('MainMenu');

    }


};