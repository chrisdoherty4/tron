<!DOCTYPE html>
<html>
    <head>
        <title>CraftyJS Practice</title>
        <script type="text/javascript" src="https://code.jquery.com/jquery-2.2.0.min.js"></script>
        <script type="text/javascript" src="js/crafty.js"></script>
        <script type="text/javascript" src="js/tron.js"></script>
        <script type="text/javascript">
            $(function () {
                var game = Tron.instance("game-canvas");
                game.start();
            });
        </script>
        
        <style type="text/css">
            body {
                margin: 0;
                padding: 0;
            }
        </style>
    </head>
    <body>
        <div id="game-canvas"></div>
    </body>
</html>