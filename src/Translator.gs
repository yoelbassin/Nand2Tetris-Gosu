uses java.io.*
uses java.util.HashMap

class Translator {
  var segments : HashMap<String, String>
  var text : String
  var className : String
  var stack = new ArrayDeque<String>();

  var c : int

  var trueCounter : int
  var falseCounter : int
  var returnCounter : int

  construct() {

    trueCounter = 0
    falseCounter = 0
    returnCounter = 0
    text = new String()
    segments = new HashMap<String, String>()
    segments.put('local', 'LCL')
    segments.put('argument', 'ARG')
    segments.put('this', 'THIS')
    segments.put('that', 'THAT')
    c = 1
    /**
    addText('@256')
    addText('D=A')
    addText('@SP')
    addText('M=D')
    call('Sys.init', '0')
     **/
  }

  function run(path : String) : void {
    var readFile = new File(path)
    if (readFile.isDirectory()) {
      foreach (var file in readFile.listFiles()) {
        var fname = String.valueOf(file)
        if (fname.split('\\\\')[fname.split('\\\\').length - 1].split('\\.')[1] == 'vm') {
          print(fname)
          translate(fname)
        }
      }
    } else {
      translate(String.valueOf(readFile))
    }
    writeToFile(path.split('\\\\')[path.split('\\\\').length - 1] + '.asm')
  }

  function translate(name : String) : void {
    className = name.split('\\\\')[name.split('\\\\').length - 1].split('\\.')[0]
    stack.push(className)
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
        case ("label"): {
          label(data[1])
          break
        }
        case ("goto"): {
          goto(data[1])
          break
        }
        case ("if-goto"): {
          if_goto(data[1])
          break
        }
        case ("call"): {
          if (data.length > 2) call(data[1], data[2])
          else call(data[1], '')
          break
        }
        case ("function"): {
          if (data.length > 2) func(data[1], data[2])
          else func(data[1], '')
          break
        }
        case ("return"): {
          ret()
          break
        }
      }
    }
//    writeToFile(className + '.asm')
  }

  function push(segment : String, x : String) : void {
    switch (segment) {
      case "local":
      case "argument":
      case "this":
      case "that": {
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
      default: {
        addText('@' + x)
        addText('D=M')
      }
    }
    addText('@SP')
    addText('A=M')
    addText('M=D')
    addText('@SP')
    addText('M=M+1')
  }

  function push(arg : String) : void {
    push('', arg)
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

        addText('@' + String.valueOf(5 + Integer.valueOf(x)))

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

    addText('@' + stack.peek() + '.TRUE' + trueCounter)
    addText('D;JEQ')
    addText('D=1')
    addText('(' + stack.peek() + '.TRUE' + trueCounter + ')')
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

    addText('@' + stack.peek() + '.TRUE' + trueCounter)
    addText('D;JGT')
    addText('D=0')
    addText('@' + stack.peek() + '.FALSE' + falseCounter)
    addText('0;JMP')
    addText('(' + stack.peek() + '.TRUE' + trueCounter + ')')
    addText('D=-1')
    addText('(' + stack.peek() + '.FALSE' + falseCounter + ')')

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

    addText('@' + stack.peek() + '.TRUE' + trueCounter)
    addText('D;JLT')
    addText('D=0')
    addText('@' + stack.peek() + '.FALSE' + falseCounter)
    addText('0;JMP')
    addText('(' + stack.peek() + '.TRUE' + trueCounter + ')')
    addText('D=-1')
    addText('(' + stack.peek() + '.FALSE' + falseCounter + ')')

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

  function label(labelName : String) : void {
    addText('(' + stack.peek() + '.' + labelName + ')')
  }

  function goto(labalName : String) : void {
    addText('@' + stack.peek() + '.' + labalName)
    addText('0;JMP')
  }

  function if_goto(labelName : String) : void {
    addText('@SP')
    addText('A=M-1')
    addText('D=M')
    addText('@SP')
    addText('M=M-1')
    addText('@' + stack.peek() + '.' + labelName)
    addText('D;JNE')
  }

  function call(func_name : String, n_args_s : String) : void {
    push('constant', func_name + '$ret.' + String.valueOf(returnCounter))

    push('LCL')

    push('ARG')

    push('THIS')

    push('THAT')

    addText('@SP')
    addText('D=M')
    addText('@5')
    addText('D=D-A')
    addText('@' + n_args_s)
    addText('D=D-A')
    addText('@ARG')
    addText('M=D')

    addText('@SP')
    addText('D=M')
    addText('@LCL')
    addText('M=D')

    addText('@' + func_name)
    addText('0;JMP')
    addText('(' + func_name + '$ret.' + String.valueOf(returnCounter) + ')')
    returnCounter++
  }


  function func(func_name : String, n_args : String) : void {
    addText('(' + func_name + ')')
    stack.push(func_name)
    for (i in 0..|Integer.valueOf(n_args)) {
      push('constant', '0')
    }
  }

  function ret() : void {
    addText('@LCL')
    addText('D=M')
    addText('@R13')
    addText('M=D')

    addText('@R13')
    addText('D=M')
    addText('@5')
    addText('D=D-A')
    addText('A=D')
    addText('D=M')
    addText('@R14')
    addText('M=D')

    addText('@SP')
    addText('A=M-1')
    addText('D=M')
    addText('@ARG')
    addText('A=M')
    addText('M=D')
    addText('@SP')
    addText('M=M-1')

    addText('@ARG')
    addText('D=M')
    addText('@SP')
    addText('M=D+1')

    addText('@R13')
    addText('D=M')
    addText('@1')
    addText('A=D-A')
    addText('D=M')
    addText('@THAT')
    addText('M=D')

    addText('@R13')
    addText('D=M')
    addText('@2')
    addText('A=D-A')
    addText('D=M')
    addText('@THIS')
    addText('M=D')

    addText('@R13')
    addText('D=M')
    addText('@3')
    addText('A=D-A')
    addText('D=M')
    addText('@ARG')
    addText('M=D')

    addText('@R13')
    addText('D=M')
    addText('@4')
    addText('A=D-A')
    addText('D=M')
    addText('@LCL')
    addText('M=D')

    addText('@R14')
    addText('A=M')
    addText('0;JMP')
    //stack.pop()
  }

  private function addText(_text : String) {
    print(String.valueOf(c) + "  " + _text)
    c++
    text += _text + '\n'
  }

  function writeToFile(name : String) {
    var writer = new FileWriter(name)
    writer.write(text)
    writer.close()
  }
}