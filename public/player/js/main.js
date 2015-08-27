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

    var txtStyle = { font: '35px Arial', fill: '#ffffff', align: 'center' };
    var txt;

    var networkManager = new NetworkManager(game);
    networkManager.setupClient();

    function preload () {
        txt = game.add.text(game.world.centerX, game.world.centerY, 'Press to Move', txtStyle);
        txt.anchor.set(0.5);
    }

    function create () {
        game.stage.disableVisibilityChange = true;
        game.stage.backgroundColor = '#000000';

        game.input.onDown.add(function () {
            networkManager.getClient().send('move');
            txt.text = 'Release to Stop';
        });

        game.input.onUp.add(function () {
            networkManager.getClient().send('stop');
            txt.text = 'Press to Move';
        });

    }

});
