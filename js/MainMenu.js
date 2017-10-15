var BasicGame = BasicGame || {};

BasicGame.MainMenu = function() {

    this.music = null;
    this.playButton = null;

};

BasicGame.MainMenu.prototype = {

    create: function() {

        //	We've already preloaded our assets, so let's kick right into the Main Menu itself.
        //	Here all we're doing is playing some music and adding a picture and button
        //	Naturally I expect you to do something significantly better :)

        this.music = this.add.audio('titleMusic');
        this.music.play();

        this.add.sprite(0, 0, 'titlepage');

        // some text on the screen
        var text = "Press play to begin";
        var style = {
            font: "30px Arial",
            fill: "#fff",
            align: "center"
        };
        var mainMenuText = this.game.add.text(this.game.width / 2, this.game.height / 2, text, style);
        mainMenuText.anchor.set(0.5);

        this.playButton = this.add.button(400, 600, 'playButton', this.startGame, this, 'buttonOver'
            , 'buttonOut', 'buttonOver');

    },

    update: function() {

        //	Do some nice funky main menu effect here

    },

    startGame: function(pointer) {

        //	Ok, the Play Button has been clicked or touched, so let's stop the music (otherwise it'll carry on playing)
        this.music.stop();

        //	And start the actual game
        this.state.start('Game');

    }

};