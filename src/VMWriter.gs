uses java.io.FileWriter

class VMWriter {
  var text : String
  construct(){
    text = ''
  }

  function writePush(segment : String, index : int){
    addText("push " + segment + " " + index)
  }

  function writePop(segment: String, index : int){
    addText("pop " + segment + " " + index)
  }

  function writeUnaryOp(command : String){
    var commandnum = {'-', '~'}.indexOf(command.charAt(0))
    var commandname = {'neg', 'not'}[commandnum]
    addText(commandname)
  }

  function writeArithmetic(command : String){
    var commandnum = {'+', '-', '*', '/', '&', '|', '<', '>', '=', '~'}.indexOf(command.charAt(0))
    var commandname = {'add', 'sub', 'call Math.multiply 2',
                        'call Math.divide 2', 'and', 'or', 'lt', 'gt', 'eq', 'not'}[commandnum]

    addText(commandname)
  }

  function writeLabel(label : String){
    addText("label " + label)
  }

  function writeGoto(label : String){
    addText("goto " + label)
  }

  function writeIf(label : String){
    addText("if-goto " + label)
  }

  function writeCall(label : String, nArgs : int){
    addText("call " + label + " " + nArgs)
  }

  function writeFunction(label : String, nlocs : int){
    addText("function " + label + " " + nlocs)
  }

  function writeReturn(){
    addText("return")
  }

  function addText(text_ : String){
    text += text_ + '\n'
  }

  function toFile(name : String){
    print(text)
    var writer = new FileWriter(name + '.vm')
    writer.write(text)
    writer.close()
  }
}