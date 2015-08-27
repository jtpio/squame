'use strict';

requirejs([
    './playerManager',
    './networkManager',
    './level',
    './vfx'
], function (PlayerManager, NetworkManager, Level, Vfx) {

    var W = 1024;
    var H = 576;
    var game;
    var vfx;

    var url;
    var urlStyle = { font: '35px Arial', fill: '#ffffff', align: 'center' };

    function buildURL(id) {
        var split = window.location.href.split('/');
        var root = split[2];
        url = root + '/player/?g='+id;
        return 'http://' + url;
    }

    function preload() {
        url = game.add.text(game.world.centerX, game.world.centerY, '', urlStyle);
        url.anchor.set(0.5);
    }

    function create() {
        game.time.advancedTiming = true;
        game.stage.disableVisibilityChange = true;

        vfx = new Vfx(game);

        var playerManager = new PlayerManager(game);
        var networkManager = new NetworkManager(game, playerManager);
        var level = new Level(game, playerManager, vfx);

        game.state.add('Level', level);

        playerManager.on('first', transition);

        networkManager.setupServer(function (gameID) {
            url.text = buildURL(gameID);
        });
    }

    function transition() {
        vfx.gameFadeOut(function () {
            game.state.start('Level');
        });
    }

    game = new Phaser.Game(W, H, Phaser.WEBGL, 'game-container', {
        preload: preload,
        create: create
    });


});
