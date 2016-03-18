
$(function() {
    (function (window) {
        var Tron = {
            
            /**
             * Holds the players created for this game.
             */
            _players: [],
            
            /**
             * Determines if the game is paused or not.
             */
            _paused: false,
            
            /**
             * A reference to the canvas used to render the game.
             */
            _canvas: null,
            
            /**
             * Initialises the game by creating the game specific objects and
             * defining the map.
             * 
             * @returns this
             */
            init: function(canvas) {
                // Set the internal variables.
                this._canvas = canvas;
                
                // Define our crafty objects.
                this._defineObjects();
                
                // Create and place our objects.
                this._createObjects();
                
                return this;
            },
            
            /**
             * Creates a new instance of the Tron game. Creating a game using 
             * the instance method will result in the game being initialised
             * correctly. 
             * 
             * Creating a game instance manually may result in an incorrectly
             * initialised game.
             */
            instance: function () {
                instance = new this();
                instance.init();
                
                return instance;
            },
            
            /**
             * Starts the game.
             * 
             * @param h Height of the game window
             * @param w Width of the game window
             * @parama element The element to use for the game.
             * 
             * @return this
             */
            start: function (h, w, element) {
                Crafty.init(h, w, element);
                
                return this;
            },
            
            /**
             * Stops the game completely and optionally resets the game state.
             * 
             * @param bool If true, clears the game state resetting everything.
             * @return this
             */
            stop: function (clear) {
                clear = (clear !== "undefined" && clear);
                
                Crafty.stop(clear);
                
                return this;
            },
            
            /**
             * Pauses this game.
             * 
             * @returns this
             */
            pause: function () {
                if (!this._paused) {
                    Crafty.pause();
                    this._paused = !this._paused;
                }
                
                return this;
            },
            
            /**
             * Unpauses a paused game.
             * 
             * @returns this
             */
            unpause: function () {
                if (this._paused) {
                    Crafty.pause();
                    this._paused = !this._paused;
                }
                
                return this;
            },
            
            /**
             * Determines whether the game is paused or not.
             * 
             * @return bool
             */
            isPaused: function () {
                return this._paused;
            },
            
            /**
             * Defines the game objects used in Tron.
             */
            _defineObjects: function () {
                // Define our craft objects.
                Crafty.c('Controllable', {
                    required: "Motion, AngularMotion",
                    
                    events: {
                        
                    }
                });
                
                Crafty.c('Square', {
                    required: '2D, WebGL, Color',
                    
                    init: function () {
                        this.w = 20;
                        this.h = 40;
                    },
                    
                    events: {
                        
                    }
                });
                
                Crafty.c('Bike', {
                    required: 'Square'
                });
            },
            
            /**
             * Creates the required objects for a game instance.
             */
            _createObjects: function () {
                this.players.push(
                    Crafty.e('Bike')
                        .attr({
                            x: 50, 
                            y: 50
                        })
                );
            }
        };

        window.Tron = Tron;
    })(window);
});