'use strict';

requirejs([
    './networkManager',
    '../../lib/jquery.min.js',
    '../../lib/lodash.min.js'
], function (NetworkManager, jquery, lodash) {

    var game = new Phaser.Game(window.innerWidth, window.innerHeight, Phaser.AUTO, 'player-canvas', {
        preload: preload,
        create: create
    }, false, false);

    var moveTxtStyle = { font: '60px Arial', fill: '#ffffff', align: 'center' };
    var moveTxt;
    var switchTxt;
    var switchTxtStyle = { font: '60px Arial', fill: '#ffffff', align: 'center' };

    var networkManager = new NetworkManager(game);
    networkManager.setupClient();

    function preload () {
        moveTxt = game.add.text(game.world.centerX, game.world.centerY * 0.5, 'Move', moveTxtStyle);
        moveTxt.anchor.set(0.5);
        moveTxt.inputEnabled = true;
        switchTxt = game.add.text(game.world.centerX, game.world.centerY * 1.5, 'Switch', switchTxtStyle);
        switchTxt.anchor.set(0.5);
        switchTxt.inputEnabled = true;
    }

    function create () {
        game.stage.disableVisibilityChange = true;
        game.stage.backgroundColor = '#000000';

        moveTxt.events.onInputDown.add(function () {
            networkManager.getClient().send('move');
            moveTxt.text = 'Stop';
        });

        moveTxt.events.onInputUp.add(function () {
            networkManager.getClient().send('stop');
            moveTxt.text = 'Move';
        });

        switchTxt.events.onInputUp.add(function () {
            console.log('sending event switch');
            networkManager.getClient().send('switch');
        });

        networkManager.getClient().on('color', function (color) {
            switchTxt.fill = '#' + color.substring(2);
        });

    }

});
