'use strict';

define([
    '../../lib/gameServer'
], function (GameServer) {

    var game;
    var server;
    var playerManager;

    var NetworkManager = function (g, pm) {
        game = g;
        playerManager = pm;
    };

    NetworkManager.prototype.setupServer = function (ready) {
        server = new GameServer('server');

        server.on('newPlayer', function (player) {
            playerManager.add(player);
        });

        server.on('gameID', function (gameID) {
            console.log('ready', gameID);
            game.gameID = gameID;
            return ready();
        });

    };

    return NetworkManager;

});
