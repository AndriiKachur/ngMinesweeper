angular.module('ngMinesweeper', [])
    .controller('MainCtrl', function($scope, Game, C) {

        Game.resetGame();

        $scope.game = Game;
        $scope.board = Game.board;
        $scope.message = '';

        $scope.className = function(field) {
            var className = '';
            if (field.flag) {
                className += ' flagged ';
            }
            return className;
        };

        $scope.toggleField = function(f) {
            if (Game.stopped) return;
            if (f.flag) return;

            if (f.value === C.mine) {
                Game.stopped = true;
                $scope.message = 'Oooops, minesweeper has only one chance for mistake...';
            }

            f.open = true;
        };
        $scope.markField = function(f) {
            if (Game.stopped) return;
            if (f.open) return;

            f.flag = !f.flag;
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

            resetGame: function () {
                game.board = {};
                game.board.rows = [];
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
                        var x = parseInt(Math.random() * game.side),
                            y = parseInt(Math.random() * game.side);
                        if (game.board.rows[x][y].value) {
                            return;
                        }
                        game.board.rows[x][y].value = C.mine;
                        return true;
                    }
                    function isMined(x, y) {
                        var r = game.board.rows;
                        return r[x] && r[x][y] && (r[x][y].value === C.mine);
                    }

                    for ( var i = 0; i < game.mines; ++i) {
                        var mineInserted = false;
                        while (!mineInserted) {
                            mineInserted = insertMine();
                        }
                    }

                    for (var i = 0; i < game.side; ++i) {
                        for (var j = 0; j < game.side; ++j) {
                            var field = game.board.rows[i][j],
                                rows = game.board.rows,
                                minesAround = 0;
                            if (field.value === C.mine) return;

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