"use strict";

var gl;
var imgContext;
var triangles;
var colors;

// returns color [r, g, b] of the left image at relative coordinates (x,y) ranging from -1 to 1
function getColor(x, y) {
    // translate to image coordinates
    var xImg = (x + 1) * 255.5;
    var yImg = (1 - y) * 255.5;
    // read pixel data
    var color = imgContext.getImageData(xImg, yImg, 1, 1).data.slice(0,3);
    // scale to [0,1] range
    var scaled = [ color[0] / 255, color[1] / 255, color[2] / 255 ];
    //console.log("getColor:", x, y, " -> ", xImg, yImg, " -> ", color, "-> ", scaled);
    return scaled;
}


window.onload = function init()
{
    // draw image onto left canvas - needed for getColor
    var origImg = document.getElementById("orig-img");
    imgContext = document.getElementById("img-canvas").getContext("2d");
    imgContext.drawImage(origImg, 0, 0);
    
    var canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    colors = [];
    triangles = [ ];
    //let identifiers = [0];
    for ( var x = 0; x < 90; x++ )
        for ( var y = x % 1; y < 90; y += 1 ) {
            // Where colors get passed in- need to find access triangle locations, and then use this information for colors. 
            //colors.push(0.1, 0.2, 0.1);

            var corners = [
                vec2(x, y),
                vec2(x, y+1),
                vec2(x+1, y+1),

            ];
            var corners2 = [
                vec2(x,y),
                vec2(x + 1, y),
                vec2(x+1, y+1)
            ];
            //identifiers.push(1 + x);
            for ( var i = 0; i < 3; i++ )
                triangles.push(add(scale(0.1, corners[i]), vec2(-1,-1)));

            for ( var i = 0; i < 3; i++ )
                triangles.push(add(scale(0.1, corners2[i]), vec2(-1,-1)));

        }
    for (var i = 0; i < triangles.length; i += 1){

        colors.push(getColor(triangles[i][0], triangles[i][1]));
    }


    //  Configure WebGL
    gl.viewport( 0, 0, canvas.width, canvas.height );
    //var bgColor = getColor(0.7,0.9); // example of getColor usage
    //gl.clearColor( bgColor[0], bgColor[1], bgColor[2], 1 );
    gl.clearColor(1.0,1.0,1.0,1.0);
    gl.enable(gl.DEPTH_TEST);
    //  Load shaders
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );


    var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

    var vColor =gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 3, gl.FLOAT, false, 0,0);
    gl.enableVertexAttribArray(vColor);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(triangles), gl.STATIC_DRAW);




    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0,0);
    gl.enableVertexAttribArray(vPosition);

    render();
};

function render() {
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
    for (let i = 0; 3*i< triangles.length; i++)
        gl.drawArrays(gl.TRIANGLES, i*3, 3);
    //gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    //gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 3);
    //gl.drawArrays(gl.TRIANGLES, 0, triangles.length - 2);
}
