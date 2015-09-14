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
        players[netPlayer.id] = netPlayer;

        netPlayer.on('disconnect', function () {
            console.log('PLAYER DISCONNECTED', netPlayer.id);
            var p = players[netPlayer.id];
            if (!p) return;
            p.off();
            delete players[netPlayer.id];

            if (events.leavePlayer) {
                events.leavePlayer(netPlayer);
            }
        });

        if (events.newPlayer) {
            events.newPlayer(netPlayer);
        }

        this.setupListeners(netPlayer);
    };

    PlayerManager.prototype.setupListeners = function (p) {
        p.off('move');
        p.off('stop');
        p.on('move', function () {
            if (events.move) {
                events.move(p);
            }
        });
        p.on('switch', function () {
            if (events.switch) {
                events.switch(p);
            }
        });
        p.on('stop', function () {
            if (events.stop) {
                events.stop(p);
            }
        });
    };

    PlayerManager.prototype.setupPlayers = function () {
        _.valuesIn(players).forEach(function (p) {
            this.setupListeners(p);
        }.bind(this));
    };

    PlayerManager.prototype.clearPlayers = function () {
        _.valuesIn(players).forEach(function (p, i) {
            p.off('move');
            p.off('stop');
            p.off('switch');
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

    PlayerManager.prototype.getPlayers = function () {
        return players;
    };

    return PlayerManager;

});
