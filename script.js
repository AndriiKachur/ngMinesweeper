angular.module('ngMinesweeper', [])
    .controller('MainCtrl', function($scope, Game, C) {

        Game.resetGame();
        $scope.game = Game;
        $scope.board = Game.board;
        $scope.message = '';

        function checkEndGame() {
            if (Game.isGameEnded()) {
                $scope.message = 'Nice work!';
                Game.stopped = true;
            }
        }

        $scope.toggleField = function(f, x, y) {
            var processed = [];
            function openField(f, x, y) {
                if (x >= 0 && x < Game.side && y >= 0 && y < Game.side) {

                    if (f === null) {
                        f = Game.board.rows[x][y];
                        if (f.processed) return;
                    }

                    f.open = true;
                    f.processed = true;
                    processed.push(f);
                    if (f.value === 0) {
                        openField(null, x - 1, y - 1);
                        openField(null, x - 1, y);
                        openField(null, x - 1, y + 1);
                        openField(null, x + 1, y - 1);
                        openField(null, x + 1, y);
                        openField(null, x + 1, y + 1);
                        openField(null, x, y + 1);
                        openField(null, x, y - 1);
                    }
                }
            }

            if (Game.stopped) return;
            if (f.flag) return;

            if (f.value === C.mine) {
                Game.stopped = true;
                $scope.message = 'Oooops, minesweeper has only one chance for mistake...';
                f.open = true;
                return;
            }
            openField(f, x, y);
            angular.forEach(processed, function(field) {
                delete field.processed;
            });
            checkEndGame();
        };
        $scope.markField = function(f) {
            if (Game.stopped) return;
            if (f.open) return;

            f.flag = !f.flag;
             checkEndGame();
        };


    })
    .directive('ngRightClick', function($parse) {
        return function(scope, element, attrs) {
            var fn = $parse(attrs.ngRightClick);
            element.bind('contextmenu', function(event) {
                scope.$apply(function() {
                    event.preventDefault();
                    fn(scope, {$event:event});
                });
            });
        };
    })
    .constant('C', {
        mine: 'm'
    })
    .factory('Game', function(C) {
        var game = {
            side: 10,
            mines: 10,
            board: null,
            stopped: false,
            minesCache: [],

            isGameEnded: function() {
                var hasNotFoundMines = Array.prototype.some.call(game.minesCache, function(mineField) {
                        if (!mineField.flag) {
                            return true;
                        }
                    });
                return !game.stopped && !hasNotFoundMines;
            },

            resetGame: function () {
                game.stopped = false;
                game.board = {};
                game.board.rows = [];
                game.minesCache = [];
                for (var i = 0, row; i < game.side; ++i) {
                    row = [];
                    for (var j = 0; j < game.side; ++j) {
                        row.push({
                            open: false,
                            value: null
                        });
                    }
                    game.board.rows.push(row);
                }

                (function insertMinesAndValues(){
                    function insertMine() {
                        var x = Math.random() * game.side | 0,
                            y = Math.random() * game.side | 0,
                            field = game.board.rows[x][y];
                        if (field.value) {
                            return;
                        }
                        field.value = C.mine;
                        game.minesCache.push(field);
                        return true;
                    }
                    function isMined(x, y) {
                        var r = game.board.rows;
                        return r[x] && r[x][y] && (r[x][y].value === C.mine);
                    }

                    for (var i = 0; i < game.mines; ++i) {
                        var mineInserted = false;
                        while (!mineInserted) {
                            mineInserted = insertMine();
                        }
                    }

                    for (var i = 0; i < game.side; ++i) {
                        for (var j = 0; j < game.side; ++j) {
                            var field = game.board.rows[i][j],
                                minesAround = 0;
                            if (field.value === C.mine) continue;

                            if (isMined(i - 1, j - 1)) ++minesAround;
                            if (isMined(i - 1, j)) ++minesAround;
                            if (isMined(i - 1, j + 1)) ++minesAround;
                            if (isMined(i + 1, j - 1)) ++minesAround;
                            if (isMined(i + 1, j)) ++minesAround;
                            if (isMined(i + 1, j + 1)) ++minesAround;
                            if (isMined(i, j + 1)) ++minesAround;
                            if (isMined(i, j - 1)) ++minesAround;

                            field.value = minesAround;
                        }
                    }
                })();
            }

        };

        return game;
    });