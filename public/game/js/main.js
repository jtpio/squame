'use strict';

requirejs([
    './playerManager',
    './networkManager',
    './connect',
    './level',
    './end',
    './vfx'
], function (PlayerManager, NetworkManager, Connect, Level, End, Vfx) {

    var W = 1024;
    var H = 576;

    var game;

    function buildURL(id) {
        var split = window.location.href.split('/');
        var root = split[2];
        return root + '/p/?g='+id;
    }

    function create() {
        game.stage.disableVisibilityChange = true;

        var vfx = new Vfx(game);
        var playerManager = new PlayerManager(game);
        var networkManager = new NetworkManager(game, playerManager);

        // states
        var connect = new Connect(game, playerManager, vfx);
        var level = new Level(game, playerManager, vfx);
        var end = new End(game, vfx);

        game.state.add('Connect', connect);
        game.state.add('Level', level);
        game.state.add('End', end);

        networkManager.setupServer(function (gameID) {
            game.url = buildURL(gameID);
            game.state.start('Connect');
        });
    }

    game = new Phaser.Game(W, H, Phaser.WEBGL, 'game-container', {
        create: create
    });
});
