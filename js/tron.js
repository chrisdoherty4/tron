
$(function() {
    (function (window) {
        var Tron = {
            /**
             * Global configuration of Tron
             */
            config: {
                /**
                 * Defines the starting scene for the game.
                 */
                startingScene: 'Debug',
                
                /**
                 * Defines the timeout for explosions. Once timed out, explosion will destroy,
                 */
                explosionTimeout: 3000,
                
                /**
                 * Defines the time a trail stays alive for.
                 */
                trailTimeout: 10000,
            },
            
            /**
             * Determines if the assets have been loaded or not.
             */
            _assetsLoaded: false,
            
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
            _scenes: {
                game: 'Game',
                debug: 'Debug',
            },
            
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
                this._defineObjects();
                this._defineScenes();
                this._loadAssets();
                
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
                return (Object.create(Tron)).init(canvasID);
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
                this._debugPrint('Starting Tron (Scene: ' + Tron.config.startingScene + ')');
                
                Crafty.audio.play('intro', -1, 0.05);
                
                Crafty.enterScene(Tron.config.startingScene, this);
                
                return this;
            },
            
            /**
             * Wrapper function to start a game of Tron safely ensuring all assets have been loaded.
             * 
             * @param Tron game
             * @returns void
             */
            startWhenLoaded: function (game) {
                if (!Tron._assetsLoaded) {
                    Crafty.log('Still waiting for assets to load...');
                    setTimeout(Tron.startWhenLoaded, 1000, game);
                    return;
                }
                
                game.start();
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
             * Loads all necessary images, sprites and audio files.
             */
            _loadAssets: function () {                
                Crafty.load({
                    sprites: {
                        "images/bike_cyan.png": {
                            tile: 32,
                            tileh: 32,
                            map: {
                                Sprite_BikeCyan: [0, 0]
                            }
                        },
                        "images/bike_orange.png": {
                            tile: 32,
                            tileh: 32,
                            map: {
                                Sprite_BikeOrange: [0, 0]
                            }
                        },
                        "images/explosion.png": {
                            tile: 64,
                            tileh: 64,
                            map: {
                                Sprite_Explosion: [0, 0]
                            }
                        },
                        "images/trail.png": {
                            tile: 32,
                            tileh: 32,
                            map: {
                                Sprite_Trail: [0, 0]
                            }
                        }
                    },
                    audio: {
                        intro: ["audio/run_wild.mp3"],
                        explosion: ["audio/explosion.mp3"]
                    }
                }, function () {
                    Tron._assetsLoaded = true;
                    Crafty.log('Assets loaded');
                });
            },
            
            /**
             * Tron._defineObjects
             * Defines the game objects used in Tron.
             */
            _defineObjects: function () {
                /**
                 * Define a generic square object.
                 */
                Crafty.c('Square', {
                    required: '2D, Canvas, Color'
                });
                
                /**
                 * 
                 */
                Crafty.c('DebugPoint', {
                    required: '2D, Canvas, Color',
                    
                    init: function () {
                        this.h = 2;
                        this.w = 2;
                        this.color('blue');
                    }
                });
                
                /**
                 * Defines a bike trail.
                 */
                Crafty.c('Trail', {
                    /**
                     * Define required components
                     */
                    required: '2D, Canvas, Color, Collision',
                    
                    /**
                     * A reference to the player associated with this trail object.
                     */
                    _player: null,
                    
                    /**
                     * Determines whether this trail object is active or not.
                     */
                    _active: false,
                    
                    /**
                     * Initialise object.
                     */
                    init: function () {
                        this.h = 6;
                        this.w = 1;
                        this.origin('center');
                        this.checkHits('Player');
                        
                        // Schedule a destroy time.
                        setTimeout(function (trail) {
                            trail._player.removeTrail(trail);
                            trail.destroy();
                        }, Tron.config.trailTimeout, this);
                        
                        // Activate the trail after some time  to avoid blowing ourselves up.
                        setTimeout(function (trail) {
                            trail.activate();
                        }, 200, this);
                    },
                    
                    /**
                     * Define events for the trail.
                     */
                    events: {
                        HitOn: function (hit) {
                            var o = hit[0].obj;
                            if (o.has('Player') && this._active) {
                                o.explode();
                            }
                        }
                    },
                    
                    /**
                     * Sets the player associated with this object.
                     * 
                     * @param player
                     * @return this
                     */
                    setPlayer: function (player) {
                        this._player = player;
                        
                        return this;
                    },
                    
                    /**
                     * Determines if this object is active or not.
                     * 
                     * @returns bool
                     */
                    isActive: function () {
                        return this._active;
                    },
                    
                    /**
                     * Activates this object making it collidable
                     * 
                     * @returns this
                     */
                    activate: function () {
                        this._active = true;
                        
                        return this;
                    }
                });
                
                /**
                 * Define a player object.
                 */
                Crafty.c('Player', {
                    /**
                     * Define required components.
                     */
                    required: '2D, Canvas, Collision',
                    
                    /**
                     * Defines the absolute centre point of this object.
                     */
                    _absoluteCentre: {
                        x: 0,
                        y: 0
                    },
                    
                    /**
                     * Defines the movement vector for this object
                     */
                    _vector: new Crafty.math.Vector2D(),
                    
                    /**
                     * Defines the current magnitude of our movement vector.
                     */
                    _magnitude: 1,
                    
                    /**
                     * Minimum required magnitude before a trail appears.
                     */
                    _trailRequiredMagnitude: 150,
                    
                    /**
                     * The trail objects associated with this Player
                     */
                    _trail: [],
                    
                    /**
                     * Defines the colour of this players trail.
                     */
                    _trailColour: '',
                    
                    /**
                     * Defines whether this object can be manipulated or not.
                     */
                    _mute: false,
                    
                    /**
                     * Initialises the objects properties.
                     */
                    init: function () {
                        this.checkHits('Player', 'Trail');
                        this.z = 10;
                        
                        this.collision([
                            11, 0,
                            11, 32,
                            23, 32,
                            23, 0,
                        ]);
                    },
                    
                    /**
                     * Defines events to hook in to.
                     */
                    events: {
                        EnterFrame: function () {
                            // Ensure the player doesn't go flying off the screen never to be
                            // seen again
                            if(this._x > Crafty.viewport.width) {
                                this.x = -this._h;
                            }
                            
                            if(this._x < -this._h) {
                                this.x =  Crafty.viewport.width;
                            }
                            
                            if(this._y > Crafty.viewport.height) {
                                this.y = -this._h;
                            }
                            
                            if(this._y < -this._h) {
                                this.y = Crafty.viewport.height;
                            }
                            
                            // Update the absolute origin
                            this._absoluteCentre.x = this.x + this._origin.x;
                            this._absoluteCentre.y = this.y + this._origin.y;
                            
                            // Calculate the vectors for the direction of the object.
                            this._vector.x = Math.sin(Crafty.math.degToRad(this._rotation));
                            this._vector.y = -Math.cos(Crafty.math.degToRad(this._rotation));
                            
                            
                        },
                        
                        HitOn: function (collision) {
                            var o = collision[0].obj;
                            if (o.has('Player')) {
                                this.explode();
                            }
                        },
                        
                        Moved: function (oldPosition) {
                            // If we're over a configurable magnitude we want to begin creating 
                            // a trail. Place the trail objects right behind the bike by negating
                            // the bikes vector and giving it a magnitude of 20, then adding 
                            // the vector to the coordinates of the objects centre point.
                            //
                            // The centrepoint is tracked on a frame by frame basis.
                            if (this._magnitude >= this._trailRequiredMagnitude) {
                                var t = Crafty.e('Trail').attr({
                                    x: (this._absoluteCentre.x),
                                    y: (this._absoluteCentre.y),
                                    rotation: this.rotation
                                }).color(this._trailColour);
                                this._trail.push(t);
                                t.setPlayer(this);
                            }
                        }
                    },
                    
                    /**
                     * Explodes this object replacing itself with an explosion object.
                     * 
                     * @returns void
                     */
                    explode: function () {
                        // Let everything know we've been muted.
                        this._mute = true;
                        
                        Crafty.e('Explosion').attr({
                            x: this.x,
                            y: this.y
                        });
                        
                        Crafty.audio.play('explosion', 1, 0.05);
                        
                        setTimeout(function (player) {
                            player.destroy();
                        }, 100, this);
                    },
                    
                    /**
                     * Removes a trail object from this Players trail.
                     */
                    removeTrail: function (trail) {
                        var i = this._trail.indexOf(trail);
                        if (i > -1) {
                            this._trail.splice(i, 1);
                        }
                    }
                });
                
                /**
                 * Defines an enemy player.
                 */
                Crafty.c('EnemyPlayer', {
                    /**
                     * Define requierd components.
                     */
                    required: 'Player, Sprite_BikeOrange',
                    
                    /**
                     * Initialise the objects parameters.
                     */
                    init: function () {
                        this._trailColour = 'rgb(255, 120, 0)';
                    }
                });
                
                /**
                 * Defines a friendly player.
                 */
                Crafty.c('FriendlyPlayer', {
                    /**
                     * Define requierd components.
                     */
                    required: 'Player, Sprite_BikeCyan',
                    
                    /**
                     * Initialise the objects parameters.
                     */
                    init: function () {
                        this._trailColour = 'cyan';
                    }
                });
                
                /**
                 * Defines a controllable player.
                 */
                Crafty.c('ControllablePlayer', {
                    /**
                     * Object requires motion and keyboard component. Angular motion is handled
                     * manually and so AngularMotion is nto required.
                     */
                    required: "FriendlyPlayer, Motion, Keyboard",
                    
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
                            if (!this._mute) {
                                // Handle rotation of the object. Prevent rotation if both arrows
                                // are pushed down.
                                if (!(this._keysPressed.LEFT && this._keysPressed.RIGHT) 
                                        && (this._keysPressed.LEFT || this._keysPressed.RIGHT)) {

                                    if (this._keysPressed.LEFT) {
                                        this.rotation-= this._rotationSpeed;
                                    }

                                    if (this._keysPressed.RIGHT) {
                                        this.rotation+= this._rotationSpeed;
                                    }
                                }

                                // Does the user want is to move forward?
                                if (this._keysPressed.UP) {
                                    // Adjust the magnitude ensuring we don't go over the limit.
                                    if (this._magnitude <= this._maxMagnitude) {
                                        this._magnitude+= this._magnitudeIncrement;
                                    }

                                    // Scale the vector to the new magnitude.
                                    this._vector.scaleToMagnitude(this._magnitude);

                                    // Adjust the x and y velocity of the objet accordingly.
                                    this.vx = this._vector.x;
                                    this.vy = this._vector.y;
                                } else {
                                    // Decrease the magnitude while it's greater than 1
                                    if (this._magnitude > 1) {
                                        this._magnitude-= this._magnitudeIncrement;
                                    }

                                    // If magnitude is less than or equal to 1 we're at the smallest 
                                    // magnitude and want to stop the object moving. If not, we want
                                    // to apply the reduced magnitude and set the velocity accordingly.
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
                            } else {
                                this.vx = 0;
                                this.vy = 0;
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
                
                /**
                 * Defines an explosion object.
                 */
                Crafty.c('Explosion', {
                    /**
                     * Define required components.
                     */
                    required: 'Sprite_Explosion, Canvas',
                    
                    /**
                     * Initialise the attributes.
                     */
                    init: function () {
                        this.origin('center');
                        this.z = 20;
                        this.rotation = Crafty.math.randomNumber(0, 359);
                        
                        setTimeout(function (explosion) {
                            explosion.destroy();
                        }, Tron.config.explosionTimeout, this);
                    }
                });
            },
            
            /**
             * Tron._createGameScene
             * Creates the required objects for a game instance.
             */
            _defineScenes: function () {
                this._debugPrint("Defining game scenes");
                
                // Define our game scene. This is the main game scene 
                Crafty.defineScene(this._scenes.game, function (game) {                    
                    var player = Crafty.e('ControllablePlayer')
                            .attr({
                                x: 100,
                                y: 100,
                                rotation: 90
                            });
                    
                    game.setPlayer(player); 
                });
                
                // Define a debug scene specifically for debugging prposes.
                Crafty.defineScene(this._scenes.debug, function (game) {        
                    Crafty.log("Loading scene debug");

                    Crafty.background('rgb(40, 40, 40) url("images/bg.png") center no-repeat');
                    
                    var options = {
                        maxParticles: 150,
                        
                        size: 30,
                        sizeRandom: 20,
                        
                        speed: 0.2,
                        speedRandom: 0.8,
                        
                        // Lifespan in frames
                        lifeSpan: 50,
                        lifeSpanRandom: 10,
                        
                        // Angle is calculated clockwise: 12pm is 0deg, 3pm is 90deg etc.
                        angle: 180,
                        angleRandom: 50,
                        
                        startColour: [40, 40, 40, 1],
                        startColourRandom: [0, 0, 0, 5],
                        
                        endColour: [60, 60, 60, 0],
                        endColourRandom: [0, 0, 0, 0],
                        
                        // Only applies when fastMode is off, specifies how sharp the gradients are drawn
                        sharpness: 80,
                        sharpnessRandom: 10,
                        
                        // Random spread from origin
                        spread: Crafty.viewport.width,
                        
                        // How many frames should this last
                        duration: -1,
                        
                        // Will draw squares instead of circle gradients
                        fastMode: true,
                        
                        gravity: {x: 0, y: 0},
                        
                        // sensible values are 0-3
                        jitter: 0,
                        
                        // Offset for the origin of the particles
                        originOffset: {x: Crafty.viewport.width / 2, y: Crafty.viewport.height / 2}
                    };
                    Crafty.e("2D,Canvas,Particles").particles(options);
                    
                    var player = Crafty.e('ControllablePlayer')
                            .attr({
                                x: 100,
                                y: 100,
                                rotation: 90
                            });
                    
                    game.setPlayer(player); 
                    
                    for (var i = 0; i < 5; i++) {
                        Crafty.e('EnemyPlayer')
                                .attr({
                                    x: Crafty.math.randomNumber(150, Crafty.viewport.width),
                                    y: Crafty.math.randomNumber(0, Crafty.viewport.height),
                                    rotation: Crafty.math.randomNumber(0, 359)
                                });
                    }
                    
//                    Crafty('*').each(function () {
//                        this.addComponent('WiredHitBox');
//                    });
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