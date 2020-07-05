import { mat4 } from "gl-matrix";
main();
//
// Start here
//
function main() {
  //   grab a reference to glCanvas
  const canvas = document.querySelector("#glCanvas");
  const gl = canvas.getContext("webgl");
  //
  //   check to see if we have a GL context, if not, show an error
  //
  if (!gl) {
    alert(
      "Unable to initialize WebGL. Your browser or machine may not support it."
    );
    return;
  }

  //
  // Vertex shader program - stored as a strinf on a variable called vsSource
  // Written in GLSL - GL Shader Language
  // Vertex shader's job is to compute vertex positions. Based on the positions the function outputs, WebGL can rasterize various kinds of primitives including points, lines, or triangles. When rasterizing these primitves, it calls second function - fragment shader

  //

  const vsSource = `
      attribute vec4 aVertexPosition;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

void main() {
  gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
}
`;

  //
  // Fragment shader program - Job is to compute a color for each pixel of the primitibve currently being drawn.
  //

  const fsSource = `
void main() {
gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
}
`;

  //
  // Initializing a shader program so that WebGL knows how to draw the data
  //   This is where all thge lighting for vertices and so forth is established
  //

  // creates a new instance of the compiled shader program
  const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

  // store attribute and uniform location for shader program

  const programInfo = {
    program: shaderProgram,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram, "aVertexPosition")
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(
        shaderProgram,
        "uProjectionMatrix"
      ),
      modelViewMatrix: gl.getUniformLocation(shaderProgram, "uModelViewMatrix")
    }
  };
  //
  //    call the routine that builds all the objects to be drawn
  //
  const buffers = initBuffers(gl);
  //
  //   Draw the scene
  //
  drawScene(gl, programInfo, buffers);
}

//
// initBuffers
//
// Initialize the needed buffers. In this case, there will be one object - a 2d `square`.
//
function initBuffers(gl) {
  const colors = [
    1.0,
    1.0,
    1.0,
    1.0, // white
    1.0,
    0.0,
    0.0,
    1.0, // red
    0.0,
    1.0,
    0.0,
    1.0, // green
    0.0,
    0.0,
    1.0,
    1.0 // blue
  ];

  const colorBuffer = gl.createBuffer();
  gl.bindBuffer = f;

  //   create the buffer for a square's positions

  const positionBuffer = gl.createBuffer();

  //   select the poisitionBuffer as the one to apply buffer operations to

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  //   create an array of positions for the square

  const positions = [1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, -1.0];

  //   pass the list of positions into WebGL to build the shape.
  //   do thisby creating a Float32Array from the JavaScript array,
  //   then use it to fill the current buffer

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  return {
    position: positionBuffer
  };
}

//
// Dynamically resize the canvas based upon viewport size
//
function resize(canvas) {
  let realToCSSPixels = window.devicePixelRatio;

  // Look up the size the browser is displaying the canvas in CSS pixels and compute a size needed to make drawingBuffer match it in device pixels.
  // support HD-DPI
  let displayWidth = Math.floor(canvas.clientWidth * realToCSSPixels);
  let displayHeight = Math.floor(canvas.clientHeight * realToCSSPixels);

  // Check to see if the canvas is  not the same size.
  if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
    //  Make the canvas the same size.
    canvas.width = displayWidth;
    canvas.height = displayHeight;
  }
}

//
// Draw the scene.
//

function drawScene(gl, programInfo, buffers) {
  // set clear to black, fully opqque
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  //   clear everything
  gl.clearDepth(1.0);
  //   enable depth testing
  gl.enable(gl.DEPTH_TEST);
  //   near things obscure far things
  gl.depthFunc(gl.LEQUAL);

  // Call the resize function
  resize(gl.canvas);

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  //
  //   Clear the canvas before drawing on it.
  //
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  //  Create a perspective matrix, a special matrix
  // that is used to simulate the distortion of perspective in a camera.
  // our field of view is 45 degre4s, with a width/height ratio
  // that matches the display size of the canvas.
  // also, we only wnat to see objects between 0.1 units
  // and 100 units away from the camera.

  const fieldOfView = (45 * Math.PI) / 100; // in radians
  const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
  const zNear = 0.1;
  const zFar = 100.0;
  const projectionMatrix = mat4.create();

  //   note: glmatrix.js always has the first argument as teh destination to recieve result.
  mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);

  //   Set the drawing position to the "identity" point, which is the center of the scene.
  const modelViewMatrix = mat4.create();

  //   Move the drawing position a bit to where I want to start the square

  mat4.translate(
    modelViewMatrix, // destination matrix
    modelViewMatrix, // matrix to translate
    [-0.0, 0.0, -6.0]
  ); // amout to translate

  //   Tell WebGL how to pull out the position from the position buffer into the vertexPosition attribute.
  {
    const numComponents = 2;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.posttion);
    gl.vertexAttribPointer(
      programInfo.attribLocations.vertexPosition,
      numComponents,
      type,
      normalize,
      stride,
      offset
    );
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
  }

  //   tell WebGL what program to use when drawing

  gl.useProgram(programInfo.program);

  //   Set the shader uniforms

  gl.uniformMatrix4fv(
    programInfo.uniformLocations.projectionMatrix,
    false,
    projectionMatrix
  );
  gl.uniformMatrix4fv(
    programInfo.uniformLocations.modelViewMatrix,
    false,
    modelViewMatrix
  );

  {
    const offset = 0;
    const vertexCount = 4;
    gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount);
  }
}

//
// INitialize a shader program to tell WebGL how to draw data
//

function initShaderProgram(gl, vsSource, fsSource) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

  //   Create shader program

  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  //   If creating shader program fails, alert

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert(
      "Unable to initialize shader program: " +
        gl.getProgramInfoLog(shaderProgram)
    );
    return null;
  }

  return shaderProgram;
}

//
//  create a shader of the given type, upoad the source and compile.
//

function loadShader(gl, type, source) {
  const shader = gl.createShader(type);

  //   send the source to the shader object

  gl.shaderSource(shader, source);

  //   compile the shader program

  gl.compileShader(shader);

  //   see if it compiled successfully

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert(
      "An error occurred compiling the shaders: ",
      +gl.getShaderInfoLog(shader)
    );
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

window.onload = main;
