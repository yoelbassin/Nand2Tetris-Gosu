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
    print('@256')
    print('D=A')
    print('@SP')
    print('M=D')
  }

  function push(segment : String, x : String) : void {
    switch (segment) {
      case "local": { //TODO implement or "argument" or "this" or "that"
        /**G1 - local, argument, this, that**/
        print('@'+segments[segment]) //A=SG
        print('D=M') //D=M[SG]
        print('@' + x) //A=X
        print('A=D+A') //A=M[SG]+X
        print('D=M') //D=M[M[SG]+X]
      }
      case "temp": {
        /**G2 - temp**/
        print('@5')
        print('D=A')
        print('@' + x)
        print('A=D+A')
        print('D=M')
      }
      case "static": {
        /**G3 - static**/
        print('@' + className + '.' + x)
        print('D=M')
      }
      case "ponter": {
        /**G4 - pointer 0, pointer 1**/
        switch (x){
         case "0": {
           print('@THIS')
         }
         case "1": {
           print('@THAT')
         }
        }
        print('D=M')
      }
      case "constant": {
        /**G5 - constant**/
        print('@' + x)
        print('D=A')
      }
      print('@SP')
      print('A=M')
      print('M=D')
      print('@SP')
      print('M=M+1')
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
    print('@SP') //A=SP
    print('A=M-1')
    print('D=M') //D=M[A]
    print('A=A-1') //A=A-1
    print('M=D+M') //M[A]=D+M[A]
    print('@SP')
    print('M=M-1')
  }

  function sub() : void {
    /** X - Y **/
    print('@SP') //A=SP
    print('A=M-1')
    print('D=M') //D=M[A]
    print('A=A-1') //A=A-1
    print('M=M-D') //M[A]=D+M[A]
    print('@SP')
    print('M=M-1')
  }

  function neg() : void {
    /** -Y **/
    print('@SP')
    print('A=M-1')
    print('M=-M')
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
    print('@SP')
    print('A=M-1')
    print('D=M')
    print('A=A-1')
    print('M=D&M')
    print('@SP')
    print('M=M-1')
  }

  function _or() : void {
    /** X or Y **/
    print('@SP')
    print('A=M-1')
    print('D=M')
    print('A=A-1')
    print('M=D|M')
    print('@SP')
    print('M=M-1')
  }

  function _not() : void {
    /** not Y **/
    print('@SP')
    print('A=M-1')
    print('M=!M')
  }

  private function addText(_text : String) {
    text += _text + '\n'
  }

  private function writeToFile(name : String) {
    var writer = new FileWriter(name)
    writer.write(text)
    writer.close()
  }
}