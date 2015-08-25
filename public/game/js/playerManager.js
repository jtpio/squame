'use strict';

define([

], function () {

    var game;
    var player;

    var events = {};

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

        player.on('move', function () {
            console.log('move');
            if (events.move) {
                events.move();
            }
        });

        player.on('stop', function () {
            console.log('stop');
            if (events.stop) {
                events.stop();
            }

        });

        if (done) done();

    };

    PlayerManager.prototype.on = function (event, cb) {
        events[event] = cb;
    };

    return PlayerManager;

});
