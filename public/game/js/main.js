'use strict';

requirejs([
    './playerManager',
    './networkManager',
    './connect',
    './level',
    './vfx'
], function (PlayerManager, NetworkManager, Connect, Level, Vfx) {

    var W = 1024;
    var H = 576;

    var game;

    function buildURL(id) {
        var split = window.location.href.split('/');
        var root = split[2];
        return root + '/player/?g='+id;
    }

    function create() {
        game.time.advancedTiming = true;
        game.stage.disableVisibilityChange = true;

        var vfx = new Vfx(game);
        var playerManager = new PlayerManager(game);
        var networkManager = new NetworkManager(game, playerManager);
        var connect = new Connect(game, playerManager, vfx);
        var level = new Level(game, playerManager, vfx);

        game.state.add('Connect', connect);
        game.state.add('Level', level);

        networkManager.setupServer(function (gameID) {
            game.url = buildURL(gameID);
            game.state.start('Connect');
        });
    }

    game = new Phaser.Game(W, H, Phaser.WEBGL, 'game-container', {
        create: create
    });
});
