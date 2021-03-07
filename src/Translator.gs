uses java.io.*
uses java.util.HashMap

class Translator {
  var segments :HashMap<String, String>
  var text : String
  var className : String

  construct() {
    segments = new HashMap<String, String>()
    segments.put('local', 'LCL')
    segments.put('argument', 'ARG')
    segments.put('this', 'THIS')
    segments.put('that', 'THAT')
    addText('@256')
    addText('D=A')
    addText('@SP')
    addText('M=D')
  }

  function push(segment : String, x : String) : void {
    switch (segment) {
      case "local": { //TODO implement or "argument" or "this" or "that"
        /**G1 - local, argument, this, that**/
        addText('@'+segments[segment]) //A=SG
        addText('D=M') //D=M[SG]
        addText('@' + x) //A=X
        addText('A=D+A') //A=M[SG]+X
        addText('D=M') //D=M[M[SG]+X]
      }
      case "temp": {
        /**G2 - temp**/
        addText('@5')
        addText('D=A')
        addText('@' + x)
        addText('A=D+A')
        addText('D=M')
      }
      case "static": {
        /**G3 - static**/
        addText('@' + className + '.' + x)
        addText('D=M')
      }
      case "ponter": {
        /**G4 - pointer 0, pointer 1**/
        switch (x){
         case "0": {
           addText('@THIS')
         }
         case "1": {
           addText('@THAT')
         }
        }
        addText('D=M')
      }
      case "constant": {
        /**G5 - constant**/
        addText('@' + x)
        addText('D=A')
      }
      addText('@SP')
      addText('A=M')
      addText('M=D')
      addText('@SP')
      addText('M=M+1')
    }
  }

  function pop(segment : String, x : int) : void {
    /**G1 - local, argument, this, that**/
    /**G2 - temp**/
    /**G3 - static**/
    /**G4 - pointer 0, pointer 1**/
  }

  function add() : void {
    /** X + Y **/
    addText('@SP') //A=SP
    addText('A=M-1')
    addText('D=M') //D=M[A]
    addText('A=A-1') //A=A-1
    addText('M=D+M') //M[A]=D+M[A]
    addText('@SP')
    addText('M=M-1')
  }

  function sub() : void {
    /** X - Y **/
    addText('@SP') //A=SP
    addText('A=M-1')
    addText('D=M') //D=M[A]
    addText('A=A-1') //A=A-1
    addText('M=M-D') //M[A]=D+M[A]
    addText('@SP')
    addText('M=M-1')
  }

  function neg() : void {
    /** -Y **/
    addText('@SP')
    addText('A=M-1')
    addText('M=-M')
  }

  function eq() : void {
    /** True if x=y and false otherwise **/
    //TODO
  }

  function gt() : void {
    /** True if x>y and false otherwise **/
    //TODO
  }

  function lt() : void {
    /** True if x<y and false otherwise **/
    //TODO
  }

  function _and() : void {
    /** X and Y **/
    addText('@SP')
    addText('A=M-1')
    addText('D=M')
    addText('A=A-1')
    addText('M=D&M')
    addText('@SP')
    addText('M=M-1')
  }

  function _or() : void {
    /** X or Y **/
    addText('@SP')
    addText('A=M-1')
    addText('D=M')
    addText('A=A-1')
    addText('M=D|M')
    addText('@SP')
    addText('M=M-1')
  }

  function _not() : void {
    /** not Y **/
    addText('@SP')
    addText('A=M-1')
    addText('M=!M')
  }

  private function addText(_text : String) {
    text += _text + '\n'
  }

  function writeToFile(name : String) {
    var writer = new FileWriter(name)
    writer.write(text)
    writer.close()
  }
}