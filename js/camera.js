class Camera {
  constructor() {
    this.matrix = glMatrix.mat4.create();
    this.viewDirection = glMatrix.vec3.create();
    this.UP = glMatrix.vec3.create();
    this.positionVector = glMatrix.vec3.fromValues(0.0, 0.0, 0.0);
    this.viewDirection = glMatrix.vec3.fromValues(0.0, 0.0, -1.0);
    this.UP = glMatrix.vec3.fromValues(0.0, 1.0, 0.0);
    this.angle = 0.0;
  }
  /**
    * viewDirection is a normalized direction vector
  * to move in the direction of viewing. Update the position
  * vector with a scaled multiple of the viewDirection
  * 
    * */
    forward() {
      let amtToMove = glMatrix.vec3.fromValues(0.0, 0.0, 0.0);
      let scaleMovement = 4;
      glMatrix.vec3.scale(amtToMove, this.viewDirection, scaleMovement);
      glMatrix.vec3.add(this.positionVector, this.positionVector, amtToMove);
      // have to update the viewDirection so that it is one infront of position
      let moveView = glMatrix.vec3.create();
      glMatrix.vec3.add(moveView, this.positionVector, this.viewDirection);
      glMatrix.mat4.lookAt(this.matrix, this.positionVector, moveView, this.UP);
    }
  
  backward() {
    let amtToMove = glMatrix.vec3.fromValues(0.0, 0.0, 0.0);
    let scaleMovement = 4;
    glMatrix.vec3.scale(amtToMove, this.viewDirection, scaleMovement);
    glMatrix.vec3.sub(this.positionVector, this.positionVector, amtToMove);
    // have to update the viewDirection so that it is one infront of position
    let moveView = glMatrix.vec3.create();
    glMatrix.vec3.add(moveView, this.positionVector, this.viewDirection);
    glMatrix.mat4.lookAt(this.matrix, this.positionVector, moveView, this.UP);
  }
  
  moveVert(direction) {
    let amtToMove = glMatrix.vec3.fromValues(0.0, 0.0, 0.0);
    let scaleMovement = direction*0.75;
    glMatrix.vec3.scale(amtToMove, this.UP, scaleMovement);
    glMatrix.vec3.sub(this.positionVector, this.positionVector, amtToMove);
    // have to update the viewDirection so that it is one infront of position
    let moveView = glMatrix.vec3.create();
    glMatrix.vec3.add(moveView, this.positionVector, this.viewDirection);
    glMatrix.mat4.lookAt(this.matrix, this.positionVector, moveView, this.UP);
  }
  
  moveHoriz(direction) {
    let cross = glMatrix.vec3.create();
    glMatrix.vec3.cross(cross, this.viewDirection, this.UP);
    glMatrix.vec3.normalize(cross,cross);
    
    let amtToMove = glMatrix.vec3.fromValues(0.0, 0.0, 0.0);
    let scaleMovement = direction*4;
    glMatrix.vec3.scale(amtToMove, cross, scaleMovement);
    glMatrix.vec3.sub(this.positionVector, this.positionVector, amtToMove);
    // have to update the viewDirection so that it is one infront of position
    let moveView = glMatrix.vec3.create();
    glMatrix.vec3.add(moveView, this.positionVector, this.viewDirection);
    glMatrix.mat4.lookAt(this.matrix, this.positionVector, moveView, this.UP);
  }
  
  rotateVert( rotateAngle ) {
    
    let cross = glMatrix.vec3.create();
    glMatrix.vec3.cross(cross, this.viewDirection, this.UP);
    glMatrix.vec3.normalize(cross,cross);
    
    let rotMat = glMatrix.mat4.create();
    glMatrix.mat4.fromRotation(rotMat, rotateAngle, cross);
    
    let tempDir = glMatrix.vec4.fromValues( this.viewDirection[0], this.viewDirection[1], this.viewDirection[2], 1);
    let tempUp = glMatrix.vec4.fromValues( this.UP[0], this.UP[1], this.UP[2], 1);
    glMatrix.vec4.transformMat4(tempDir, tempDir, rotMat);
    glMatrix.vec4.transformMat4(tempUp, tempUp, rotMat);
    this.viewDirection = glMatrix.vec3.fromValues( tempDir[0], tempDir[1], tempDir[2]);
    this.UP = glMatrix.vec3.fromValues( tempUp[0], tempUp[1], tempUp[2]);
    
    let moveView = glMatrix.vec3.create();
    glMatrix.vec3.add(moveView, this.positionVector, this.viewDirection);
    glMatrix.mat4.lookAt(this.matrix, this.positionVector, moveView, this.UP);
  }
  
  
  rotateHorizontal( rotateAngle ) {
    
    let rotMat = glMatrix.mat4.create();
    glMatrix.mat4.fromRotation(rotMat, rotateAngle, this.UP);
    
    let tempDir = glMatrix.vec4.fromValues( this.viewDirection[0], this.viewDirection[1], this.viewDirection[2], 1);
    let tempUp = glMatrix.vec4.fromValues( this.UP[0], this.UP[1], this.UP[2], 1);
    glMatrix.vec4.transformMat4(tempDir, tempDir, rotMat);
    glMatrix.vec4.transformMat4(tempUp, tempUp, rotMat);
    this.viewDirection = glMatrix.vec3.fromValues( tempDir[0], tempDir[1], tempDir[2]);
    this.UP = glMatrix.vec3.fromValues( tempUp[0], tempUp[1], tempUp[2]);
    
    let moveView = glMatrix.vec3.create();
    glMatrix.vec3.add(moveView, this.positionVector, this.viewDirection);
    glMatrix.mat4.lookAt(this.matrix, this.positionVector, moveView, this.UP);
  }
  
  
  /*
  get matrix() {
    return matrix;
  }*/
  
}