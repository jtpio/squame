'use strict';

define([], function () {

    var game;
    var playerManager;

    var vfx;

    var url;
    var urlStyle = { font: '35px Arial', fill: '#ffffff', align: 'center' };

    var flashTimeout;

    function transition(state) {
        vfx.gameFadeOut(function () {
            game.state.start(state);
        });
    }

    function Connect(g, pm, v) {
        game = g;
        playerManager = pm;
        vfx = v;
    }

    Connect.prototype.create = function () {
        vfx.displayPlayers();

        playerManager.on('newPlayer', function (total) {
            if (total === 2) { transition('Level'); }
        });
        playerManager.on('leavePlayer', function (total) {
            if (total < 2) { transition('Connect'); }
        });

        url = game.add.text(game.world.centerX, game.world.centerY, game.url, urlStyle);
        url.anchor.set(0.5);

        (function flash () {
            vfx.flash();
            flashTimeout = setTimeout(flash, game.rnd.between(1000, 3000));
        })();
    };

    Connect.prototype.render = function () {
        vfx.renderPlayers(playerManager.getNumberPlayers());
    };

    return Connect;
});
