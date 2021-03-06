uses java.io.*

class Translator {
  var sp : int
  var text : String

  construct() {
    sp = 0
  }

  function push(segment : String, x : int) : void {
    /**G1 - local, argument, this, that**/
    print('@' + segment) //A=SG
    print('D=M') //D=M[SG]
    print('@' + x) //A=X
    print('A=D+A') //A=M[SG]+X
    print('D=M') //D=M[M[SG]+X]
    print('@' + sp) //A=SP
    print('M=D') //M[SP]=M[M[SG]+X]
    print('@' + sp) //A=SP
    print('M=M+1') //M[SP]=M[SP]+1
    /**G2 - temp**/
    /**G3 - static**/
    /**G4 - pointer 0, pointer 1**/
    /**G5 - constant**/
  }

  function pop(segment : String, x : int) : void {
    /**G1 - local, argument, this, that**/
    /**G2 - temp**/
    /**G3 - static**/
    /**G4 - pointer 0, pointer 1**/
  }

  function add() : void {
    /** X + Y **/
    print('@' + sp) //A=SP
    print('A=M')
    print('D=M') //D=M[A]
    print('A=A-1') //A=A-1
    print('M=D+M') //M[A]=D+M[A]
  }

  function sub() : void {
    /** X - Y **/
    //TODO
  }

  function neg() : void {
    /** -Y **/
    //TODO
  }

  function eq() : void {
    /** True if x=y and false otherwise **/
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
    //TODO
  }

  function _or() : void {
    /** X or Y **/
    //TODO
  }

  function _not() : void {
    /** not Y **/

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