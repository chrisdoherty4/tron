
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
                     * Defines the maximum velocity the object can move.
                     */
                    _maximumVelocity: 200,
                    
                    /**
                     * Defines the rate at which acceleration should increase per second.
                     */
                    _accelerationRate: 80,
                    
                    /**
                     * Defines the rotational speed of the object.
                     */
                    _rotationSpeed: 100,
                    
                    /**
                     * Defines the front point and therefore face of the controllabel object.
                     */
                    _frontPoint: null,
                    
                    /**
                     * Defines the back point and therefore rear face of the controllable object.
                     */
                    _rearPoint: null,
                    
                    /**
                     * Sets the origin to the centre of the object so we rotate correctly.
                     */
                    init: function () {
                        this.origin('center');
                        
                        this._setFrontAndRear();
                    },
                    
                    /**
                     * Binds key down and up events and handles movement caps.
                     */
                    events: {
                        KeyDown: function (e) {
                            // If we're moving, and the key pressed is a directional change then 
                            // apply some rotation.
                            if ((e.keyCode === Crafty.keys.RIGHT_ARROW || 
                                    e.keyCode === Crafty.keys.LEFT_ARROW)
                                    && this.isMoving()) {
                                if (this.isDown('RIGHT_ARROW')) {
                                    this.rotateRight(true);
                                }

                                if (this.isDown('LEFT_ARROW')) {
                                    this.rotateLeft(true);
                                }
                            }
                            
                            if (this.isDown('UP_ARROW')) {
                                this.accelerate();
                            }
                        },
                        
                        KeyUp: function (e) {
                            if (e.keyCode === Crafty.keys.RIGHT_ARROW
                                    && !this.isDown('LEFT_ARROW')) {
                                this.rotateRight(false);
                            }
                            
                            if (e.keyCode === Crafty.keys.LEFT_ARROW
                                    && !this.isDown('RIGHT_ARROW')) {
                                this.rotateLeft(false);
                            }
                            
                            if (e.keyCode === Crafty.keys.UP_ARROW) {
                                this.decelerate();
                            }
                        },
                        
                        MotionChange: function (change) {
                            if (change.key === "vx") {
                                if (this.vx <= 0) {
                                    this.ax = 0;
                                    this.vx = 0;
                                } else if (Math.pow(this.vx, 2) >= Math.pow(this._maximumVelocity, 2)) {
                                    this.ax = 0;
                                    this.vx = this._maximumVelocity;
                                }
                            }
                        }
                    },
                    
                    /**
                     * #.rotateRight
                     * Rotates the object right.
                     * 
                     * @param bool turn True to stat turn, false to stop.
                     * @returns this
                     */
                    rotateRight: function (turn) {
                        if (turn) {
                            this.vrotation = this._rotationSpeed;
                        } else {
                            this.stopRotation();
                        }
                        
                        return this;
                    },
                    
                    /**
                     * #.rotateLeft
                     * Rotates the object left.
                     * 
                     * @param bool turn True to stat turn, false to stop.
                     * @returns this
                     */
                    rotateLeft: function (turn) {
                        if (turn) {
                            this.vrotation = this._rotationSpeed * -1;
                        } else {
                            this.stopRotation();
                        }
                        
                        return this;
                    },
                    
                    /**
                     * #.stopTurn
                     * Stops the rotation in either direction.
                     * 
                     * @returns this
                     */
                    stopRotation: function () {
                        this.vrotation = 0;
                        
                        return this;
                    },
                    
                    /**
                     * #.accelerate
                     * Applies the acceleration rate to the object.
                     * 
                     * @param int rate
                     * @returns this
                     */
                    accelerate: function () {
                        this.ax = this._accelerationRate;
                        
                        return this;
                    },
                    
                    /**
                     * #.decelerate
                     * Applies negative acceleration to the object.
                     * 
                     * @param int rate
                     * @returns this
                     */
                    decelerate: function (rate) {
                        this.ax = this._accelerationRate * -1;
                        
                        return this;
                    },
                    
                    /**
                     * #.setRotationalSpeed
                     * Sets the speed at which the object should rotate. Default 100.
                     * 
                     * @param int speed
                     * @returns this
                     */
                    setRotationalSpeed: function (speed) {
                        this._rotationalSpeed = speed;
                        
                        return this;
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
                    
                    _setFrontAndRear: function() {
                        var fp = Crafty.e('Point');
                        this.attach(fp);
                        fp.y = this.y + (this.h / 2);
                        fp.z = 100;
                        this._frontPoint = fp;
                        
                        var rp = Crafty.e('Point');
                        this.attach(rp);
                        rp.y+= (this.h / 2);
                        rp.x+= this.w - 1;
                        this._rearPoint = rp;
                    }
                });
                
                Crafty.c('Square', {
                    required: '2D, Canvas, Color',
                    
                    init: function () {
                        this.w = 40;
                        this.h = 20;
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