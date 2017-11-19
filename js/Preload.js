var BasicGame = BasicGame || {};

BasicGame.Preloader = function() {

    this.background = null;
    this.preloadBar = null;

    this.ready = false;

};
console.log("preloader!!!!!!!!!");
BasicGame.Preloader.prototype = {

    preload: function() {

        //show loading screen
        this.preloadBar = this.add.sprite(this.game.world.centerX, this.game.world.centerY, 'preloaderBar');
        this.preloadBar.anchor.setTo(0.5);
        this.preloadBar.scale.setTo(5);

        //	This sets the preloadBar sprite as a loader sprite.
        //	What that does is automatically crop the sprite from 0 to full-width
        //	as the files below are loaded in.
        this.load.setPreloadSprite(this.preloadBar);

        this.load.image('titlepage', 'assets/images/game_title.png');
        this.load.image('playButton', 'assets/images/play_button.png');
        this.load.audio('titleMusic', 'assets/audio/Pixelland.mp3');
        this.load.audio('gamePlayMusic', 'assets/audio/DooblyDoo.mp3' )
        this.load.bitmapFont('caslon', 'fonts/caslon.png', 'fonts/caslon.xml');
        //	+ lots of other required assets here

         //load game assets
         // these comands are for stop-motion animation
         // first is the key for the spritesheet, next the location of the spritesheet
         // the next two are height and width, then the number of frames in teh spritesheet
        this.load.spritesheet('dog', 'assets/images/dog_walk.png', 122, 92, 2);
        this.load.spritesheet('playerScratch', 'assets/images/dog_scratch.png', 116, 100, 2);
        this.load.spritesheet('playerDig', 'assets/images/dog_dig.png', 129, 100, 2);

        // static game images
        this.load.image('ground', 'assets/images/ground.png');
        this.load.image('grass', 'assets/images/grass.png');

        // audio game files
        this.load.audio('whine', ['assets/audio/whine.ogg', 'assets/audio/whine.mp3']);
        this.load.audio('bark', ['assets/audio/bark.ogg', 'assets/audio/bark.mp3']);

        //from https://gamedevacademy.org/html5-phaser-tutorial-spacehipster-a-space-exploration-game/
        this.load.image('mound', 'assets/images/rock.png');
    
        //Adapted from https://openclipart.org/detail/6570/flea:
        this.load.image('flea', 'assets/images/flea.png');
        this.load.image('bone', 'assets/images/toys/bone.png');
        this.load.image('ball', 'assets/images/toys/tennisball.png')

    },

    create: function() {

        //	Once the load has finished we disable the crop because we're going to
        //  sit in the update loop for a short while as the music decodes
        this.preloadBar.cropEnabled = false;

    },

    update: function() {

        //	You don't actually need to do this, but I find it gives a much smoother game experience.
        //	Basically it will wait for our audio file to be decoded before proceeding to the MainMenu.
        //	You can jump right into the menu if you want and still play the music, but you'll have a few
        //	seconds of delay while the mp3 decodes - so if you need your music to be in-sync with your menu
        //	it's best to wait for it to decode here first, then carry on.

        //	If you don't have any music in your game then put the game.state.start line into the create function and delete
        //	the update function completely.

        if (this.cache.isSoundDecoded('titleMusic') && this.ready == false) {
            this.ready = true;
            this.state.start('MainMenu');
        }

    }

};
