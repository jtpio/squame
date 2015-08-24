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

    var networkManager = new NetworkManager(game);
    networkManager.setupClient();

    function preload () {

    }

    function create () {
        game.stage.backgroundColor = '#000000';

        networkManager.getClient().send('rotate', 90);
    }

});
