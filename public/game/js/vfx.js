'use strict';

define([
], function () {

    var game;
    var colors;
    var squares;
    var players;

    var Vfx = function (g) {
        game = g;
    };

    function fade(to, cb) {
        var tween = game.add.tween(game.world).to({ alpha: to }, 500, 'Linear', true);
        tween.onComplete.add(function () {
            if (cb) {
                return cb();
            }
        }, tween);
    }

    Vfx.prototype.gameFadeOut = function (cb) {
        return fade(0, cb);
    };

    Vfx.prototype.gameFadeIn = function (cb) {
        return fade(1, cb);
    };

    Vfx.prototype.flash = function (sounds, n) {
        squares.forEach(function (s, i) {
            game.add.tween(s)
                .from({ alpha: 1})
                .to({ alpha: 0 }, 500, Phaser.Easing.Bounce.Out, true, game.rnd.between(1500, 3000), 0, true)
                .onStart.add(function () {
                    if (i < n) {
                        sounds[i].play();
                    }
                });
        });
    };

    Vfx.prototype.displayPlayers = function () {
        squares = [game.add.graphics(0,0), game.add.graphics(0,0)];
        colors = [0xff1400, 0x75b300];

        players = [
            new Phaser.Rectangle(0, 0, game.width, 0.5*game.height),
            new Phaser.Rectangle(0, 0.5*game.height, game.width, 0.5*game.height)
        ];
    };

    Vfx.prototype.renderPlayers = function (n) {
        squares.forEach(function (s) {
            s.clear();
        });

        for (var i = 0; i < n; i++) {
            var p = players[i];
            squares[i].lineStyle(40, 0x000000, 1);
            squares[i].beginFill(colors[Math.max(i,n-1)]);
            squares[i].drawRect(p.x, p.y, p.width, p.height);
            squares[i].endFill();
        }

    };

    return Vfx;

});
