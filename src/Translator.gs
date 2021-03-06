uses java.io.*

class Translator {
  var sp : int
  var text : String

  construct(){
    sp = 0
  }

  function push(segment: String, x:int){
    print('@'+segment) //A=SG
    print('D=M') //D=M[SG]
    print('@'+x) //A=X
    print('A=D+A') //A=M[SG]+X
    print('D=M') //D=M[M[SG]+X]
    print('@'+sp) //A=SP
    print('M=D') //M[SP]=M[M[SG]+X]
    print('@'+sp) //A=SP
    print('M=M+1') //M[SP]=M[SP]+1
  }








  function add(){
    print('@'+sp) //A=SP
    print('D=M') //D=M[A]
    print('A=A-1') //A=A-1
    print('M=D+M') //M[A]=D+M[A]
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