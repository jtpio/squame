'use strict';

requirejs([
    './playerManager',
    './networkManager',
    './level',
], function (PlayerManager, NetworkManager, Level) {

    var W = window.innerWidth;
    var H = window.innerHeight;
    var game;

    function create() {
        game.stage.disableVisibilityChange = true;
        var playerManager = new PlayerManager(game);
        var networkManager = new NetworkManager(game, playerManager);
        var level = new Level(game, playerManager);

        game.state.add('Level', level);

        networkManager.setupServer(function (gameID) {
            game.state.start('Level');
        });
    }

    game = new Phaser.Game(W, H, Phaser.AUTO, 'game-container', {
        create: create
    });


});
