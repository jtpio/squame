'use strict';

define([], function () {

    var game;
    var players;

    var events = {};

    var PlayerManager = function (g) {
        game = g;
        players = {};
    };

    PlayerManager.prototype.add = function(netPlayer) {
        if (_.keys(players).length >= 2) {
            netPlayer.send('kicked');
            return;
        }

        players[netPlayer.id] = netPlayer;

        netPlayer.on('disconnect', function () {
            console.log('PLAYER DISCONNECTED', netPlayer.id);
            var p = players[netPlayer.id];
            if (!p) return;
            p.off();
            delete players[netPlayer.id];

            if (events.leavePlayer) {
                events.leavePlayer(_.keys(players).length);
            }
        });

        if (events.newPlayer) {
            events.newPlayer(_.keys(players).length);
        }
    };

    PlayerManager.prototype.setupPlayers = function () {
        _.valuesIn(players).forEach(function (p, i) {
            p.off();
            p.on('move', function () {
                if (events.move) {
                    events.move(i);
                }
            });
            p.on('stop', function () {
                if (events.stop) {
                    events.stop(i);
                }
            });
        });
    };

    PlayerManager.prototype.clearPlayers = function () {
        _.valuesIn(players).forEach(function (p, i) {
            p.off();
        });
    };

    PlayerManager.prototype.getNumberPlayers = function () {
        return _.keys(players).length;
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
