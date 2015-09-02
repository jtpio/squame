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

        server.on('gameID', function (gameID) {
            console.log('Received game ID', gameID);
            game.gameID = gameID;

            server.on('newPlayer', function (player) {
                playerManager.add(player);
            });

            return ready(gameID);
        });
    };

    return NetworkManager;

});
