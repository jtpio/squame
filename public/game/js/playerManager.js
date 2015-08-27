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

        if (events.first) {
            events.first();
        }
    };

    PlayerManager.prototype.setupPlayer = function (done) {
        player.off();
        player.on('move', function () {
            if (events.move) {
                events.move();
            }
        });
        player.on('stop', function () {
            if (events.stop) {
                events.stop();
            }
        });
        if (done) done();
    };

    PlayerManager.prototype.clearPlayer = function (done) {
        player.off();
        if (done) done();
    };

    PlayerManager.prototype.on = function (event, cb) {
        events[event] = cb;
    };

    PlayerManager.prototype.off = function (event) {
        if (event) {
            delete events[event];
        } else {
            events = {};
        }
    };

    return PlayerManager;

});
