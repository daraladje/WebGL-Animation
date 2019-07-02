let obj;  // for debugging in chrome console
let ModelMaterialsArray = []; // an array of materials
let ModelAttributeArray = []; // vertices, normals, textcoords, uv
let gl;
let shdProg;

let camera = new Camera();



window.addEventListener("keydown", processKeyPressed, false);


function myMain() {

    /**
    *   Load external model. The model is stored in
        two Arrays
            * ModelMaterialsArray[]
                each index has set material of uniforms for a draw call
                {ambient, diffuse, specular, ...}

            * ModelAttributeArray[]
                each index contains set of attributes for a draw call
                {vertices, normals, texture coords, indices and materialindex number}

                the materialindex number specifies which index in the ModelMaterialsArray[]
                has the illumination uniforms for this draw call

    */

    loadExternalJSON(['Models/DROGON.json', 'Models/ironman.json', 'Models/valley.json', 'Models/nightking.json', 'Models/Thanos Armor.json', 'Models/helic.json']);
}

function setUpWebGL() {
    const canvas = document.querySelector('canvas');
    gl = canvas.getContext('webgl2');
    console.log(gl);
    if (!gl) {
        alert('Error, obtaining webgl2 unsuccessful ');
        return null;
    }
    
    const vertexSource = fetch('vertex.txt')
        .then(function (response) {
            console.log('response object is returning vertex source ...');
            return response.text();
        });
    const fragSource = fetch('frag.txt')
        .then(function (response) {
            console.log('response object is returning frag source ...');
            return response.text();
        });

    // Create map to hold text for shaders (sync statement)
    const shaderSource = { "vsrc": {}, "fsrc": {} };

    // async, will only execute when vertexSource && fragSource completes
    Promise.all([vertexSource, fragSource])
        .then(function (sourcesText) {
            console.log('===Resolved Promise.all====');
            shaderSource["vsrc"] = sourcesText[0];
            shaderSource["fsrc"] = sourcesText[1];
        })
        .then(function () {
                shdProg = initShaders(gl, shaderSource["vsrc"], shaderSource["fsrc"])
                for( m = 0; m <  ModelAttributeArray.length; m++){
                    for(idx = 1; idx < ModelAttributeArray[m].length; idx++){
                        initObjects(gl, ModelAttributeArray[m][idx], ModelMaterialsArray[m][ModelAttributeArray[m][idx].matIndex+1]);
                    }
                }
                drawScene();
        });
}

function initObjects(gl, modelObj, mater) {

    modelObj.vertexObject = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, modelObj.vertexObject);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(modelObj.vertices), gl.STATIC_DRAW);

    modelObj.indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, modelObj.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,  new Uint16Array(modelObj.indexs), gl.STATIC_DRAW);
    modelObj.textImageBuffer = loadTexture(gl,mater.textureImageName);

    modelObj.texBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, modelObj.texBufferObject);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(modelObj.textureCoords), gl.STATIC_DRAW);
    
    
    modelObj.normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, modelObj.normalBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,  new Float32Array(modelObj.normals), gl.STATIC_DRAW);
    
}

function drawScene() {  
    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT, gl.DEPTH_BUFFER_BIT);
    gl.useProgram(shdProg);
    let projMatrix = glMatrix.mat4.create();
    glMatrix.mat4.perspective(projMatrix, Math.PI/3, 1.333, 0.1, 1000.0); 
    let proj = gl.getUniformLocation( shdProg, 'perspectiveMatrix');
    gl.uniformMatrix4fv(proj, false, projMatrix);
    
    let cameraView = gl.getUniformLocation( shdProg, 'viewMatrix');
    gl.uniformMatrix4fv(cameraView, false, camera.matrix );
    let eyeposition = gl.getUniformLocation( shdProg, 'eyepos');
    gl.uniform3fv(eyeposition, camera.positionVector); 
    for( m = 0; m <  ModelAttributeArray.length; m++){//ModelAttributeArray[m].length
        for( idx = 1; idx < ModelAttributeArray[m].length; idx++){
         // attributes = ModelAttributeArray[m][idx];
         // materials = ModelMaterialsArray[m][attributes.matIndex+1];

          let modelView = gl.getUniformLocation( shdProg, 'modelMatrix');
  
          let rotMat = glMatrix.mat4.create(); 
          let tranMat = glMatrix.mat4.create(); 
          let scaleMat = glMatrix.mat4.create(); 
          let output = glMatrix.mat4.create(); 

          gl.bindBuffer(gl.ARRAY_BUFFER, ModelAttributeArray[m][idx].vertexObject);
          ModelAttributeArray[m][idx].vertexLoc = gl.getAttribLocation(shdProg, 'vertPosition');
          gl.vertexAttribPointer(ModelAttributeArray[m][idx].vertexLoc, 3, gl.FLOAT, false, 0, 0);
          gl.enableVertexAttribArray(ModelAttributeArray[m][idx].vertexLoc);

          gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ModelAttributeArray[m][idx].normalBuffer);
          ModelAttributeArray[m][idx].normalLoc = gl.getAttribLocation(shdProg, 'vertNormal');
          gl.vertexAttribPointer(ModelAttributeArray[m][idx].normalLoc, 3, gl.FLOAT, false, 0, 0);
          gl.enableVertexAttribArray(ModelAttributeArray[m][idx].normalLoc);
    
          ModelAttributeArray[m][idx].coordLoc = gl.getAttribLocation(shdProg, 'vTextCoord');
          gl.bindBuffer(gl.ARRAY_BUFFER, ModelAttributeArray[m][idx].texBufferObject);
          gl.vertexAttribPointer(ModelAttributeArray[m][idx].coordLoc, 2, gl.FLOAT, false, 0, 0);
          gl.enableVertexAttribArray(ModelAttributeArray[m][idx].coordLoc);
          
          gl.activeTexture(gl.TEXTURE0);
          gl.bindTexture(gl.TEXTURE_2D, ModelAttributeArray[m][idx].textImageBuffer);
          let textureLocation = gl.getUniformLocation( shdProg, 'textureSampler');
          gl.uniform1i(textureLocation, 0);

          if( ModelAttributeArray[m][0] == 'Models/DROGON.json' ){
                      let date = Date.now() * 0.0001;
                      let rotPoint = glMatrix.mat4.create();
                      glMatrix.mat4.fromTranslation(tranMat, [0,-5,-220 ] );
                       glMatrix.mat4.fromTranslation(rotPoint, [ -Math.cos(date) * 100, 0, Math.sin(date) * 100]);
                       glMatrix.mat4.mul(tranMat, rotPoint, tranMat);
                      glMatrix.mat4.fromScaling(scaleMat, [ 2, 2, 2 ] );
                      glMatrix.mat4.fromYRotation( rotMat, date);
                      
          }
          else if(ModelAttributeArray[m][0] == 'Models/ironman.json'){
                          //glMatrix.mat4.fromTranslation(tranMat, [0,-10,-100 ] );
                       //glMatrix.mat4.fromYRotation( rotMat, 0);
                     //                        glMatrix.mat4.fromScaling(scaleMat, [ 0.2, .2, .2 ] );
                      let date = Date.now() * 0.0001;
                      let rotPoint = glMatrix.mat4.create();
                      glMatrix.mat4.fromTranslation(tranMat, [0,3,-220 ] );
                       glMatrix.mat4.fromTranslation(rotPoint, [ -Math.cos(date) * 100, 0, Math.sin(date) * 100]);
                       glMatrix.mat4.mul(tranMat, rotPoint, tranMat);
                      glMatrix.mat4.fromScaling(scaleMat, [ 0.2, .2, .2 ] );
                      glMatrix.mat4.fromYRotation( rotMat, date);
          }
          else if(ModelAttributeArray[m][0] == 'Models/nightking.json'){
                     glMatrix.mat4.fromTranslation(tranMat, [-5,-15,-220 ]); 
                      glMatrix.mat4.fromScaling(scaleMat, [ 15, 15, 15 ] );
                      glMatrix.mat4.fromYRotation( rotMat,Math.PI/2);
          }
          else if(ModelAttributeArray[m][0] == 'Models/Thanos Armor.json'){
                    glMatrix.mat4.fromTranslation(tranMat, [5,-30,-220] );  //[5,-30,-220 ]); 
                    glMatrix.mat4.fromScaling(scaleMat, [ 0.5, 0.5, 0.5 ] );
                    let thanosturn = glMatrix.mat4.create();
                    glMatrix.mat4.fromYRotation( thanosturn, -Math.PI/2);
                    glMatrix.mat4.fromXRotation( rotMat, -Math.PI/2);
                    glMatrix.mat4.mul(rotMat, thanosturn, rotMat);
          }
          else if(ModelAttributeArray[m][0] == 'Models/helic.json'){
                     glMatrix.mat4.fromTranslation(tranMat, [0,35,-220 ]); 
                      glMatrix.mat4.fromScaling(scaleMat, [ 0.5, 0.5, 0.5 ] );
                      glMatrix.mat4.fromYRotation( rotMat,Math.PI/2);
                      if( idx == 14 || idx == 6 || idx == 30 || idx == 34 || idx == 41){
                        let date = Date.now() * 0.001;
                        let rotPoint = glMatrix.mat4.create();
                        let transCheck = glMatrix.mat4.create();
                        glMatrix.mat4.fromTranslation(transCheck, [0,0,-14.5 ]); 
                        glMatrix.mat4.fromYRotation( rotPoint, date);
                        glMatrix.mat4.mul(rotPoint,rotPoint, transCheck);
                        glMatrix.mat4.fromTranslation(transCheck, [0,0,14.5 ]); 
                        glMatrix.mat4.mul(rotPoint,transCheck, rotPoint);
                        glMatrix.mat4.mul(rotMat,rotMat, rotPoint);
                      }
                      if( idx == 48 || idx == 59 || idx == 71 || idx == 16 || idx == 29){
                        let date = Date.now() * 0.001;
                        let rotPoint = glMatrix.mat4.create();
                        let transCheck = glMatrix.mat4.create();
                        glMatrix.mat4.fromTranslation(transCheck, [-2, -17,34]); 
                        glMatrix.mat4.fromXRotation( rotPoint, date);
                        glMatrix.mat4.mul(rotPoint,rotPoint, transCheck);
                        glMatrix.mat4.fromTranslation(transCheck, [2,17.5,-32.5]); 
                        glMatrix.mat4.mul(rotPoint,transCheck, rotPoint);
                        glMatrix.mat4.mul(rotMat,rotMat, rotPoint);
                      }

          }
          else{
             glMatrix.mat4.fromTranslation(tranMat, [-150,40,-10  ]);//-150,40,-10 
             glMatrix.mat4.fromScaling(scaleMat, [500,500,500 ] );//500,500,500
             glMatrix.mat4.fromYRotation( rotMat, Math.PI/2);
          }
                        glMatrix.mat4.mul(output, tranMat, rotMat)
                        glMatrix.mat4.mul(output, output, scaleMat)

          gl.uniformMatrix4fv(modelView, false, output);
    
          let normalMatrix = glMatrix.mat4.create();
          let normalMatrixPosition = gl.getUniformLocation( shdProg, 'normalMatrix');
          glMatrix.mat4.copy(normalMatrix, camera.matrix);
          glMatrix.mat4.multiply( normalMatrix, normalMatrix, output); // this is now the model view matrix
          glMatrix.mat4.invert(normalMatrix, normalMatrix);
          glMatrix.mat4.transpose(normalMatrix, normalMatrix);
          gl.uniformMatrix4fv(normalMatrixPosition, false, normalMatrix);
    
          let diffuseLightColor = gl.getUniformLocation(shdProg, 'diffuse');
          gl.uniform3fv(diffuseLightColor, [0.6,0.6,0.6]);//[ ModelMaterialsArray[m][ModelAttributeArray[m][idx].matIndex+1].diffuse[0], ModelMaterialsArray[m][ModelAttributeArray[m][idx].matIndex+1].diffuse[1], ModelMaterialsArray[m][ModelAttributeArray[m][idx].matIndex+1].diffuse[2] ]);
      
          let ambientLightColor = gl.getUniformLocation(shdProg, 'ambient');
          gl.uniform3fv(ambientLightColor, [0.8,0.8,0.8]);
    
          let shine = gl.getUniformLocation( shdProg, 'shine');
          gl.uniform1f(shine, ModelMaterialsArray[m][ModelAttributeArray[m][idx].matIndex+1].shininess);   
    
          let specularLightColor = gl.getUniformLocation(shdProg, 'specular');
          gl.uniform3fv(specularLightColor, [ ModelMaterialsArray[m][ModelAttributeArray[m][idx].matIndex+1].specular[0], ModelMaterialsArray[m][ModelAttributeArray[m][idx].matIndex+1].specular[1], ModelMaterialsArray[m][ModelAttributeArray[m][idx].matIndex+1].specular[2] ] );
    
          let lightCol = gl.getUniformLocation(shdProg, 'lightColor');
          gl.uniform3fv(lightCol, [1.0,1.0,1.0] );
          
          let lightPos = gl.getUniformLocation(shdProg, 'lightDir');
          gl.uniform3fv(lightPos, [0,1,-1] );
          
          gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ModelAttributeArray[m][idx].indexBuffer);
          gl.drawElements(gl.TRIANGLES, ModelAttributeArray[m][idx].indexs.length, gl.UNSIGNED_SHORT, 0);
        }
    }
    requestAnimationFrame(drawScene); 
}


function createModelAttributeArray(obj2, modelNum) {
    // obj.mesh[x] is an array of attributes
    // vertices, normals, texture coord, indices

    // get number of meshes
    let numMeshIndexs = obj2.meshes.length;
    let idx = 0;
    for (idx = 0; idx < numMeshIndexs; idx++) {
        let modelObj = {};

        modelObj.vertices = obj2.meshes[idx].vertices;
        
        modelObj.normals = obj2.meshes[idx].normals;

        // now get index array data from faces, [[x,y,z], [x,y,z], ...]
        // to [x,y,z,x,y,z,...]. use array concat to transform
        //modelObj.indexs = [].concat(...obj2.meshes[idx].faces);
        modelObj.indexs = obj2.meshes[idx].faces.flat();

        //which material index to use for this set of indices?
        modelObj.matIndex = obj2.meshes[idx].materialindex; //index for materials array

        if (obj2.meshes[idx].texturecoords !== undefined)
            modelObj.textureCoords = obj2.meshes[idx].texturecoords[0];
        else
            console.log(`texture coords for ${idx} does not exist`);

        // push onto array
        ModelAttributeArray[modelNum].push(modelObj);
    }
}
function createMaterialsArray(obj2, modelNum){
    console.log('In createMaterialsArray...');
    // length of the materials array
    // loop through array extracting material properites 
    // needed for rendering
    let itr = obj2.materials.length;
    let idx = 0;
    for (idx = 0; idx < itr; idx++) {
        let met = {};
        // shainding 
        met.shadingm = obj2.materials[idx].properties[1].value;
        met.ambient = obj2.materials[idx].properties[2].value;
        met.diffuse = obj2.materials[idx].properties[3].value;
        met.specular = obj2.materials[idx].properties[4].value;
        met.shininess = obj2.materials[idx].properties[5].value;

        /* Not all models have textures, the below code checks for to see if a file attribute exists
         * if it does, we extract the name of the texture file.  requires ES6
         * 
         */
        let foundTextImageProperty = obj2.materials[idx].properties.find(x => x.key === '$tex.file');
           if( foundTextImageProperty !== undefined){
               met.textureImageName = foundTextImageProperty.value; // name of texture file

          }
        // object containing all the illumination comp needed to 
        // ill faces using material properties for index idx
        ModelMaterialsArray[modelNum].push(met);
    }
}


// load an external object using 
// newer fecth() and promises
// input is url for requested object
// 
function loadExternalJSON(urls) {
  var count = 0;
  Promise.all(  urls.map( url =>
    fetch(url)
      .then((resp) => {
            // if the fect do not result in an network error
            if (resp.ok)
                return resp.json(); // return response as JSON
            throw new Error(`Could not get ${url}`);
        })
        .then(function (ModelInJson) {
              ModelMaterialsArray.push([url]);
              ModelAttributeArray.push([url]);
              obj = ModelInJson;
              createMaterialsArray(ModelInJson, count);
              createModelAttributeArray(ModelInJson, count);
              count = count+1;
        })
    )).then(function(){
       setUpWebGL();
    })
        .catch(function (error) {
            // error retireving resource put up alerts...
            alert(error);
            console.log(error);
        });
}



function processKeyPressed(e) {
    // forward
    if (e.code === "KeyW") {
          camera.forward();
          console.log( camera.positionVector);
    }
    // backward
    if (e.code === "KeyS") {
         camera.backward();
    }

    // Up
    if (e.code === "KeyR") {
        camera.moveVert(-1.0);
    }
    //Down 
    if (e.code === "KeyF") {
        camera.moveVert(1.0);
    }
    //Rotate Left 
    if (e.code === "KeyJ") {
        camera.rotateHorizontal(Math.PI/36);
    }
    //Rotate Right 
    if (e.code === "KeyK") {
        camera.rotateHorizontal(-Math.PI/36);
    }
    
    //Rotate Up 
    if (e.code === "KeyE") {
        camera.rotateVert(Math.PI/36);
    }
    //Rotate Down 
    if (e.code === "KeyC") {
        camera.rotateVert(-Math.PI/36);
    }
    
    //Left
    if (e.code === "KeyA") {
        camera.moveHoriz(1);
    }
    //Right
    if (e.code === "KeyD") {
        camera.moveHoriz(-1);
    }
    
}

function loadTexture(gl, url) {
  
  
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Because images have to be download over the internet
  // they might take a moment until they are ready.
  // Until then put a single pixel in the texture so we can
  // use it immediately. When the image has finished downloading
  // we'll update the texture with the contents of the image.
  const level = 0;
  const internalFormat = gl.RGBA;
  const width = 1;
  const height = 1;
  const border = 0;
  const srcFormat = gl.RGBA;
  const srcType = gl.UNSIGNED_BYTE;
  const pixel = new Uint8Array([0, 0, 255, 255]);  // opaque blue
  gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                width, height, border, srcFormat, srcType,
                pixel);
                

  const image = new Image();
  image.onload = function() {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                  srcFormat, srcType, image);

    if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
       // Yes, it's a power of 2. Generate mips.
       gl.generateMipmap(gl.TEXTURE_2D);
    } else {

      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR );

    }
  }
  image.src = url;

  return texture;
}

function isPowerOf2(value) {
  return (value & (value - 1)) == 0;
}