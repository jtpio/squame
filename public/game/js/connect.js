'use strict';

define([], function () {

    var game;
    var playerManager;

    var vfx;

    var url;
    var urlStyle = { font: '35px Arial', fill: '#ffffff', align: 'center' };

    var flashTimeout;

    function transition() {
        setTimeout(function () {
            vfx.gameFadeOut(function () {
                game.state.start('Level', true, false);
            });
        }, 2000);
    }

    function reinit() {
        vfx.gameFadeOut(function () {
            game.state.start('Connect', true, false);
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
            if (total === 2) { transition(); }
        });
        playerManager.on('leavePlayer', function (total) {
            if (total < 2) { reinit(); }
        });

        url = game.add.text(game.world.centerX, game.world.centerY, game.url, urlStyle);
        url.anchor.set(0.5);

        (function flash () {
            vfx.flash();
            flashTimeout = setTimeout(flash, game.rnd.between(1000, 3000));
        })();

        vfx.gameFadeIn();
    };

    Connect.prototype.render = function () {
        vfx.renderPlayers(playerManager.getNumberPlayers());
    };

    return Connect;
});
