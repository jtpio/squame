'use strict';

define([], function () {

    var game;
    var playerManager;

    var vfx;

    var url;
    var urlStyle = { font: '35px Arial', fill: '#ffffff', align: 'center' };

    var flashTimeout;
    var blinkSounds;

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

    Connect.prototype.preload = function () {
        game.load.audio('blink1', ['../../assets/sounds/Jingle_Win_Synth_02.mp3']);
        game.load.audio('blink2', ['../../assets/sounds/Jingle_Win_Synth_03.mp3']);
    };

    Connect.prototype.create = function () {
        blinkSounds = [game.add.audio('blink1'), game.add.audio('blink2')];

        vfx.displayPlayers();


        url = game.add.text(game.world.centerX, game.world.centerY, game.url, urlStyle);
        url.anchor.set(0.5);

        (function flash () {
            vfx.flash(blinkSounds, playerManager.getNumberPlayers());
            flashTimeout = setTimeout(flash, game.rnd.between(1000, 3000));
        })();

        vfx.gameFadeIn();

        playerManager.on('leavePlayer', function (total) {
            if (total < 2) { reinit(); }
        });

        if (playerManager.getNumberPlayers() === 2) {
            return transition();
        }

        playerManager.on('newPlayer', function (total) {
            if (total === 2) { transition(); }
        });
    };

    Connect.prototype.render = function () {
        vfx.renderPlayers(playerManager.getNumberPlayers());
    };

    Connect.prototype.shutdown = function () {
        clearTimeout(flashTimeout);
    };

    return Connect;
});
