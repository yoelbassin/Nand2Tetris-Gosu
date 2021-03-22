uses java.io.*
uses java.util.HashMap

class Translator {
  var segments : HashMap<String, String>
  var text : String
  var className : String

  var trueCounter : int
  var falseCounter : int

  construct() {
    trueCounter = 0
    falseCounter = 0
    text = new String()
    segments = new HashMap<String, String>()
    segments.put('local', 'LCL')
    segments.put('argument', 'ARG')
    segments.put('this', 'THIS')
    segments.put('that', 'THAT')
  }

  function translate(name : String) : void {
    className = name.split('\\\\')[name.split('\\\\').length-1].split('\\.')[0]
    var file = new File(name)
    var reader = new Scanner(file)
    while (reader.hasNextLine()) {
      var data = reader.nextLine().split(" ")
      print(data)
      switch (data[0]) {
        case ("add"): {
          add()
          break
        }
        case ("sub"): {
          sub()
          break
        }
        case ("neg"): {
          neg()
          break
        }
        case ("eq"): {
          eq()
          break
        }
        case ("gt"): {
          gt()
          break
        }
        case ("lt"): {
          lt()
          break
        }
        case ("and"): {
          _and()
          break
        }
        case ("or"): {
          _or()
          break
        }
        case ("not"): {
          _not()
          break
        }
        case ("push"): {
          push(data[1], data[2])
          break
        }
        case ("pop"): {
          pop(data[1], data[2])
          break
        }
      }
    }
    writeToFile('test.asm')
  }

  function push(segment : String, x : String) : void {
    switch (segment) {
      case "local":
      case "argument":
      case "this":
      case "that":  {
        /**G1 - local, argument, this, that**/
        addText('@' + segments[segment]) //A=SG
        addText('D=M') //D=M[SG]
        addText('@' + x) //A=X
        addText('A=D+A') //A=M[SG]+X
        addText('D=M') //D=M[M[SG]+X]
        break
      }
      case "temp": {
        /**G2 - temp**/
        addText('@5')
        addText('D=A')
        addText('@' + x)
        addText('A=D+A')
        addText('D=M')
        break
      }
      case "static": {
        /**G3 - static**/
        addText('@' + className + '.' + x)
        addText('D=M')
        break
      }
      case "pointer": {
        /**G4 - pointer 0, pointer 1**/
        switch (x) {
          case "0": {
            addText('@THIS')
            break
          }
          case "1": {
            addText('@THAT')
            break
          }
        }
        addText('D=M')
        break
      }
      case "constant": {
        /**G5 - constant**/
        addText('@' + x)
        addText('D=A')
        break
      }
    }
    addText('@SP')
    addText('A=M')
    addText('M=D')
    addText('@SP')
    addText('M=M+1')
  }

  function pop(segment : String, x : String) : void {
    switch (segment) {
      case "local":
      case "argument":
      case "this":
      case "that": {
        /**G1 - local, argument, this, that**/
        addText('@' + segments[segment])
        addText('D=M')
        addText('@' + x)
        addText('D=D+A')
        addText('@R13')
        addText('M=D')
        addText('@SP')
        addText('A=M-1')
        addText('D=M')
        addText('@R13')
        addText('A=M')
        addText('M=D')
        addText('@SP')
        addText('M=M-1')
        break
      }
      case "temp": {
        /**G2 - temp**/
        addText('@SP')
        addText('A=M-1')
        addText('D=M')

        addText('@' + String.valueOf(5+Integer.valueOf(x)))

        addText('M=D')
        addText('@SP')
        addText('M=M-1')
        break
      }
      case "static": {
        /**G3 - static**/
        addText('@SP')
        addText('A=M-1')
        addText('D=M')

        addText('@' + className + '.' + x)

        addText('M=D')
        addText('@SP')
        addText('M=M-1')
        break
      }
      case "pointer": {
        /**G4 - pointer 0, pointer 1**/
        addText('@SP')
        addText('A=M-1')
        addText('D=M')

        switch (x) {
          case "0": {
            addText('@THIS')
            break
          }
          case "1": {
            addText('@THAT')
            break
          }
        }
        addText('M=D')
        addText('@SP')
        addText('M=M-1')
        break
      }
    }
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
    addText('@SP') //A=SP
    addText('A=M-1') //A=M[SP]-1
    addText('D=M') //D=M[M[SP]-1]  - X
    addText('A=A-1') //A=M[SP]-2
    addText('D=M-D') //D= Y - X

    addText('@TRUE' + trueCounter)
    addText('D;JEQ')
    addText('D=1')
    addText('(TRUE' + trueCounter + ')')
    addText('D=D-1')

    addText('@SP')
    addText('M=M-1')
    addText('@SP')
    addText('A=M-1')
    addText('M=D')
    trueCounter++
  }

  function gt() : void {
    /** True if x>y and false otherwise **/
    addText('@SP') //A=SP
    addText('A=M-1') //A=M[SP]-1
    addText('D=M') //D=M[M[SP]-1]
    addText('A=A-1') //A=M[SP]-2
    addText('D=M-D') //D= Y - X

    addText('@TRUE' + trueCounter)
    addText('D;JGT')
    addText('D=0')
    addText('@FALSE' + falseCounter)
    addText('0;JMP')
    addText('(TRUE' + trueCounter + ')')
    addText('D=-1')
    addText('(FALSE' + falseCounter + ')')

    addText('@SP')
    addText('M=M-1')
    addText('@SP')
    addText('A=M-1')
    addText('M=D')
    trueCounter++
    falseCounter++
  }

  function lt() : void {
    /** True if x<y and false otherwise **/
    addText('@SP') //A=SP
    addText('A=M-1') //A=M[SP]-1
    addText('D=M') //D=M[M[SP]-1]
    addText('A=A-1') //A=M[SP]-2
    addText('D=M-D') //D= Y - X

    addText('@TRUE' + trueCounter)
    addText('D;JLT')
    addText('D=0')
    addText('@FALSE' + falseCounter)
    addText('0;JMP')
    addText('(TRUE' + trueCounter + ')')
    addText('D=-1')
    addText('(FALSE' + falseCounter + ')')

    addText('@SP')
    addText('M=M-1')
    addText('@SP')
    addText('A=M-1')
    addText('M=D')
    trueCounter++
    falseCounter++
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
    print(_text)
    text += _text + '\n'
  }

  function writeToFile(name : String) {
    var writer = new FileWriter(name)
    writer.write(text)
    writer.close()
  }
}