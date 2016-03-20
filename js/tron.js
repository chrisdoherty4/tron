
$(function() {
    (function (window) {
        var Tron = {
            /**
             * Holds the players created for this game.
             */
            _player: null,
            
            /**
             * Determines if the game is paused or not.
             */
            _paused: false,
            
            /**
             * A reference to the canvas used to render the game. It's a DOM element, nothing 
             * to do with Crafty.
             */
            _canvas: null,
            
            /**
             * Defines the name of the game scene identifier when registered with Crafty.
             */
            _gameScene: 'game',
            
            /**
             * Tron.init
             * Initialises the game by creating the game specific objects and
             * defining the map.
             * 
             * @returns this
             */
            init: function(canvasID) {
                Crafty.logginEnabled = true;
                
                this._debugPrint("Initialising Tron");
                
                // Setup the game
                this._setupCanvas(canvasID);
                
                // Define our crafty objects.
                this._defineObjects();
                
                // Create the game scene in preparation for the game to begin.
                this._createGameScene();
                
                return this;
            },
            
            /**
             * Tron.instance
             * Creates a new instance of the Tron game. Creating a game using 
             * the instance method will result in the game being initialised
             * correctly. 
             * 
             * Creating a game instance manually may result in an incorrectly
             * initialised game.
             */
            instance: function (canvasID) {
                return Object.create(Tron).init(canvasID);
            },
            
            /**
             * Tron.start
             * Starts the game.
             * 
             * @param h Height of the game window
             * @param w Width of the game window
             * @parama element The element to use for the game.
             * 
             * @return this
             */
            start: function () {
                this._debugPrint("Starting game");
                
                Crafty.enterScene(this._gameScene, this);
                
                return this;
            },
            
            /**
             * Tron.stop
             * Stops the game completely and optionally resets the game state.
             * 
             * @param bool If true, clears the game state resetting everything.
             * @return this
             */
            stop: function () {
                this._debugPrint("Stopping game");
                
                return this;
            },
            
            /**
             * Tron.pause
             * Pauses this game.
             * 
             * @returns this
             */
            pause: function () {
                this._debugPrint("Pausing game");
                
                if (!this._paused) {
                    Crafty.pause();
                    this._paused = !this._paused;
                }
                
                return this;
            },
            
            /**
             * Tron.unpause
             * Unpauses a paused game.
             * 
             * @returns this
             */
            unpause: function () {
                this._debugPrint("Unpausing game");
                
                if (this._paused) {
                    Crafty.pause();
                    this._paused = !this._paused;
                }
                
                return this;
            },
            
            /**
             * Tron.isPaused
             * Determines whether the game is paused or not.
             * 
             * @return bool
             */
            isPaused: function () {
                return this._paused;
            },
            
            /**
             * Tron.setPlayer
             * Sets the internal reference to the player.
             * 
             * @param Crafty.e player
             * @returns this
             */
            setPlayer: function (player) {
                this._player = player;
                
                return this;
            },
            
            /**
             * Tron._setupCanvas
             * Creates the canvas and initialises the game. Then pauses the game and waits for
             * it to start.
             * 
             * @param string canvas
             * @returns void
             */
            _setupCanvas: function (canvasID) {
                this._canvas = document.getElementById(canvasID);
                Crafty.init(this._canvas.style.width, this._canvas.style.height);
            },
            
            /**
             * Tron._defineObjects
             * Defines the game objects used in Tron.
             */
            _defineObjects: function () {
                Crafty.c('Point', {
                    required: '2D',
                    
                    init: function () {
                        this.h = 0;
                        this.w = 0;
                    },
                    
                    enableDebug: function () {
                        this.addComponent('Canvas, Color').color('yellow').attr({
                            h: 1,
                            w: 1
                        });
                    },
                    
                    disableDebug: function() {
                        this.removeComponent('Canvas, Color');
                    }
                });
                
                Crafty.c('Controllable', {
                    required: "Motion, AngularMotion, Keyboard",
                    
                    /**
                     * Defines the magnitude used to multiply the movement vector to denote the 
                     * maximum velocity the object can travel in in the x and y planes.
                     */
                    _maxMagnitude: 300,
                    
                    /**
                     * Defines the magnitude to apply to the objects acceleration properties when
                     * manipulating the objects movement vector.
                     */
                    _magnitudeIncrement: 5,
                    
                    /**
                     * Defines the current magnitude of our movement vector.
                     */
                    _magnitude: 1,
                    
                    /**
                     * Defines the movement vector for this object
                     */
                    _vector: new Crafty.math.Vector2D(),
                    
                    /**
                     * Defines the rotational speed of the object.
                     */
                    _rotationSpeed: 7,
                    
                    /**
                     * Defines whether the up key has been pressed or not.
                     */
                    _keysPressed: {
                        UP: false,
                        LEFT: false,
                        RIGHT: false,
                    },
                    
                    /**
                     * Initialiser function to set the objects default properties.
                     */
                    init: function () {
                        // Set the origin 
                        this.origin('center');
                    },
                    
                    /**
                     * Binds key down and up events and handles movement caps.
                     */
                    events: {
                        KeyDown: function (e) {
                            // If we're moving, and the key pressed is a directional change then 
                            // apply some rotation.
                            if (e.keyCode === Crafty.keys.RIGHT_ARROW) {
                                this._keysPressed.RIGHT = true;
                            }
                            
                            if (e.keyCode === Crafty.keys.LEFT_ARROW) {
                                this._keysPressed.LEFT = true;
                            }
                            
                            if (e.keyCode === Crafty.keys.UP_ARROW) {
                                this._keysPressed.UP = true;
                            }
                        },
                        
                        KeyUp: function (e) {
                            if (e.keyCode === Crafty.keys.RIGHT_ARROW) {
                                this._keysPressed.RIGHT = false;
                            }
                            
                            if (e.keyCode === Crafty.keys.LEFT_ARROW) {
                                this._keysPressed.LEFT = false;
                            }
                            
                            if (e.keyCode === Crafty.keys.UP_ARROW) {
                                this._keysPressed.UP = false;
                            }
                        },                        
                        
                        EnterFrame: function () {                   
                            if (!(this._keysPressed.LEFT && this._keysPressed.RIGHT) 
                                    && (this._keysPressed.LEFT || this._keysPressed.RIGHT)) {
                                
                                if (this._keysPressed.LEFT) {
                                    this._rotation-= this._rotationSpeed;
                                }
                                
                                if (this._keysPressed.RIGHT) {
                                    this._rotation+= this._rotationSpeed;
                                }
                            }
                            
                            // Calculate the vectors for the direction of the object.
                            this._vector.x = Math.sin(Crafty.math.degToRad(this._rotation));
                            this._vector.y = -Math.cos(Crafty.math.degToRad(this._rotation));

                            // Does the user want is to move forward?
                            if(this._keysPressed.UP) {
                                if (this._magnitude <= this._maxMagnitude) {
                                    this._magnitude+= this._magnitudeIncrement;
                                }
                                
                                this._vector.scaleToMagnitude(this._magnitude);
                                
                                this.vx = this._vector.x;
                                this.vy = this._vector.y;
                            } else {
                                if (this._magnitude > 1) {
                                    this._magnitude-= this._magnitudeIncrement;
                                }
                                
                                if (this._magnitude <= 1) {
                                    this._magnitude = 1;
                                    this.vx = 0;
                                    this.vy = 0;
                                } else {
                                    this._vector.scaleToMagnitude(this._magnitude);
                                    this.vx = this._vector.x;
                                    this.vy = this._vector.y;
                                }
                            }
                        }
                    },
                    
                    /**
                     * #.isMoving
                     * Determines if this object is moving or not.
                     * 
                     * @returns bool
                     */
                    isMoving: function () {
                        var v = this.velocity();
                        return (v.x !== 0 || v.y !== 0);
                    },
                });
                
                Crafty.c('Square', {
                    required: '2D, Canvas, Color',
                    
                    init: function () {
                        this.w = 20;
                        this.h = 40;
                    },
                });
                
                Crafty.c('Player', {
                    required: 'Square'
                });
                
                Crafty.c('ControllablePlayer', {
                    required: 'Player, Controllable'
                });
            },
            
            /**
             * Tron._createGameScene
             * Creates the required objects for a game instance.
             */
            _createGameScene: function () {
                this._debugPrint("Creating the game scene");
                
                Crafty.defineScene(this._gameScene, function (game) {
                    Crafty.background('#000');
                    
                    var player = Crafty.e('ControllablePlayer')
                            .attr({
                                x: 100,
                                y: 100
                            })
                            .color('red');
                    game.setPlayer(player); 
                });
            },
            
            /**
             * Tron._debugPrint
             * If debug enabled, will print a debug message to the console.
             * 
             * @param string m
             * @returns this
             */
            _debugPrint: function (m) {
                Crafty.log(m);
                return this;
            }
        };

        window.Tron = Tron;
    })(window);
});