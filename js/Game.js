var BasicGame = BasicGame || {};

console.log("Game!!!!!!!!!");
BasicGame.Game = function() {

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

    preload: function() {
        this.game.time.advancedTiming = true;
    },

    create: function() {

    //  Honestly, just about anything could go here. It's YOUR game after all. Eat your heart out!

    //set up background and ground layer
    this.game.world.setBounds(0, 0, 3500, this.game.height);
    this.grass = this.add.tileSprite(0,this.game.height-100,this.game.world.width,70,'grass');
    this.ground = this.add.tileSprite(0,this.game.height-70,this.game.world.width,70,'ground');
    
    //create player and walk animation
    this.player = this.game.add.sprite(this.game.width/2, this.game.height-90, 'dog');
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
    //this.game.world.bringToTop(this.player);
 
    
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
    this.player.digDimensions = {width: playerDigImg.width, height: playerDigImg.height};
    
    var playerScratchImg = this.game.cache.getImage('playerScratch');
    this.player.animations.add('scratch');
    this.player.scratchDimensions = {width: playerScratchImg.width, height: playerScratchImg.height};
    
    this.player.standDimensions = {width: this.player.width, height: this.player.height};
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

    update: function() {

        //  Honestly, just about anything could go here. It's YOUR game after all. Eat your heart out!

        // player land on ground instead of falling through
        this.game.physics.arcade.collide(this.player, this.ground, this.playerHit, null, this);

        // player bitten by a flea
        this.game.physics.arcade.collide(this.player, this.fleas, this.playerBit, null, this);

        // player can overlap with dirt mounds
        this.game.physics.arcade.overlap(this.player, this.mounds, this.collect, this.checkDig, this);

    },

    render: function() {
        //this.game.debug.text(this.game.time.fps || '--', 20, 70, "#00ff00", "40px Courier");   
    },

    generateMounds: function() {
        this.mounds = this.game.add.group();
     
        //enable physics in them
        this.mounds.enableBody = true;
     
        //phaser's random number generator
        var numMounds = this.game.rnd.integerInRange(0, 5)
        var mound;
     
        for (var i = 0; i < numMounds; i++) {
          //add sprite within an area excluding the beginning and ending
          //  of the game world so items won't suddenly appear or disappear when wrapping
          var x = this.game.rnd.integerInRange(this.game.width, this.game.world.width - this.game.width);
          mound = this.mounds.create(x, this.game.height-75, 'mound');
          mound.body.velocity.x = 0;
        }
      },

      generateFleas: function() {
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
          flea = this.fleas.create(x, this.game.height-115, 'flea');
     
          //physics properties
          flea.body.velocity.x = this.game.rnd.integerInRange(-20, 0);
          
          flea.body.immovable = true;
          flea.body.collideWorldBounds = false;
        }
      },

    quitGame: function(pointer) {

        //  Here you should destroy anything you no longer need.
        //  Stop music, delete sprites, purge caches, free resources, all that good stuff.

        //  Then let's go back to the main menu.
        this.state.start('MainMenu');

    }
        

};