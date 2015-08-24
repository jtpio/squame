'use strict';

define([

], function () {

    var game;
    var player;

    var PlayerManager = function (g) {
        game = g;
    };

    PlayerManager.prototype.add = function(netPlayer) {
        player = netPlayer;

        // handle the disconnect event
        player.on('disconnect', function () {
            console.log('PLAYER DISCONNECTED', netPlayer.id);
            if (!player) return;
            player.off();
        });

        this.setupPlayer();
    };

    PlayerManager.prototype.setupPlayer = function (done) {

        player.on('rotate', function (angle) {
            console.log(angle);
        });

        if (done) done();

    };

    return PlayerManager;

});
