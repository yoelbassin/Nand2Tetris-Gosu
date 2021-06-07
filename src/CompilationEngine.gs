uses java.io.File
uses java.io.FileWriter

class CompilationEngine {

  var symTable : SymbolTable

  var tokenizer : Tokenizer

  var vmwriter : VMWriter

  var text : String = ''

  var curClass : String = ''

  var curSub : String = ''

  var curSubType : String = ''

  var curSubRet : String = ''

  var ifCounter = 0
  var whileCounter = 0

  construct(path : String) {
    var readFile = new File(path)
    if (readFile.isDirectory()) {
      foreach (var file in readFile.listFiles()) {
        var fname = String.valueOf(file)
        if (fname.split('\\\\')[fname.split('\\\\').length - 1].split('\\.')[1] == 'jack') {
          print(fname)
          tokenizer = new Tokenizer(fname)
          vmwriter = new VMWriter()
          compileClass()
          writeToFile(fname.split('\\.')[0])
          text = ''
          vmwriter.toFile(fname.split('\\.')[0])
        }
      }
    } else {
      var fname = String.valueOf(readFile)
      print(fname)
      tokenizer = new Tokenizer(fname)
      vmwriter = new VMWriter()
      compileClass()
      writeToFile(fname.split('\\.')[0])
      vmwriter.toFile(fname.split('\\.')[0])
    }


  }


  function compileClass() {
    /** 'class' classname '{' classVarDec* subroutineDec* '}' **/

    ifCounter = 0
    whileCounter = 0

    symTable = new SymbolTable()

    addText('<class>')


    checkToken('class')

    curClass = tokenizer.curToken

    checkIdentifier()

    checkToken('{')

    while (isToken('static') or isToken('field')) {
      compileClassVarDec()
    }

    while (isToken('constructor') or isToken('function') or isToken('method')) {
      compileSubroutineDec()
    }

    checkToken('}')

    addText('</class>')
  }

  function compileClassVarDec() {
    /** ('static' | 'field') type varName [',' varName]* ';' **/
    addText('<classVarDec>')

    if (not isToken('static') and not isToken('field')) {
      error('static or field')
    }

    var kind = tokenizer.curToken

    printCurrent()

    var type = compileType()

    do {
      var name = tokenizer.curToken
      checkIdentifier()
      symTable.define(name, type, kind)
      if (isToken(';')) {

        printCurrent()
        break
      } else if (isToken(',')) {

        printCurrent()
      } else {
        error(', or ;')
      }
    }
    while (true)

    addText('</classVarDec>')
  }

  function compileType() : String {
    /** 'int | char | boolean | className **/
    if (not isToken('int') and not isToken('char') and not isToken('boolean') and not isIdentifier()) {
      error('int or char or boolean or classname')
    }
    var type = tokenizer.curToken
    printCurrent()
    return type
  }

  function compileSubroutineDec() {
    /** ('constructor' | 'function' | 'method') ('void' | type) subroutineName '(' parameterList ')' subroutineBody **/
    addText('<subroutineDec>')

    if (not isToken('constructor') and not isToken('function') and not isToken('method')) {
      error('constructor or function or method')
    }


    symTable.startSub()
    if (isToken('method')) {
      symTable.define('this', curClass, "ARG")
    }
    curSubType = tokenizer.curToken

    printCurrent()

    curSubRet = ""

    if (not isToken('void')) {
      curSubRet = compileType()
    } else {
      curSubRet = tokenizer.curToken
      printCurrent()
    }

    curSub = tokenizer.curToken
    print('cursub: ' + curSub)

    checkIdentifier()
    checkToken('(')
    compileParameterList()
    checkToken(')')
    compileSubroutineBody()
    addText('</subroutineDec>')
  }


  function compileParameterList() {
    /** ((type varName) (',' type varName)*)? **/
    addText('<parameterList>')
    if (isToken(')')) {
    } else {
      do {
        var type = compileType()
        symTable.define(tokenizer.curToken, type, "ARG")
        checkIdentifier()
        if (not isToken(',')) {
          break
        }
        printCurrent()
      } while (true)
    }

    addText('</parameterList>')
  }

  function compileSubroutineBody() {
    /** '{' varDec* statement '}' **/
    addText('<subroutineBody>')
    checkToken('{')
    while (isToken('var')) {
      varDec()
    }

    writeSubroutineDec()

    compileStatement()

    checkToken('}')
    addText('</subroutineBody>')
  }

  function writeSubroutineDec() {
    vmwriter.writeFunction(curClass + '.' + curSub, symTable.varCount('VAR'))
    print(symTable.toString())
    if (curSubType.toUpperCase() == 'METHOD') {
      vmwriter.writePush('argument', 0)
      vmwriter.writePop('pointer', 0)
    } else if (curSubType.toUpperCase() == 'CONSTRUCTOR') {
      vmwriter.writePush('constant', symTable.varCount('FIELD'))
      vmwriter.writeCall('Memory.alloc', 1)
      vmwriter.writePop('pointer', 0)
    }
  }

  function varDec() {
    /** 'var' type varName (',' varName)* ';' **/
    addText('<varDec>')

    checkToken('var')

    var type = compileType()

    do {
      symTable.define(tokenizer.curToken, type, 'VAR')
      checkIdentifier()

      if (isToken(';')) {
        printCurrent()
        break
      }
      if (isToken(',')) {
        printCurrent()
      } else {
        error(', or ;')
      }

    } while (true)

    addText('</varDec>')
  }

  function compileStatement() {
    /** (letStatement | ifStatement | whileStatement | doStatement | returnStatement)* **/
    addText('<statements>')
    while (isToken('let') or isToken('if') or isToken('while') or isToken('do') or isToken('return')) {
      if (isToken('let')) {
        letStatement()
      } else if (isToken('if')) {
        ifStatement()
      } else if (isToken('while')) {
        whileStatement()
      } else if (isToken('do')) {
        doStatement()
      } else if (isToken('return')) {
        returnStatement()
      }
    }
    addText('</statements>')
  }

  function letStatement() {
    /** 'let' varName ('[' expression ']')? '=' expression ';' **/
    addText('<letStatement>')
    checkToken('let')
    var varName = tokenizer.curToken
    var isArray = false
    checkIdentifier()
    if (isToken('[')) {
      vmwriter.writePush(symTable.segmentOf(varName), symTable.indexOf(varName))
      checkToken('[')
      isArray = true
      compileExpression()
      vmwriter.writeArithmetic('+')
      checkToken(']')
    }
    checkToken('=')
    compileExpression()
    checkToken(';')
    if (isArray) {
      vmwriter.writePop('temp', 0)
      vmwriter.writePop('pointer', 1)
      vmwriter.writePush('temp', 0)
      vmwriter.writePop('that', 0)
    } else {
      vmwriter.writePop(symTable.segmentOf(varName), symTable.indexOf(varName))
    }
    addText('</letStatement>')
  }

  function ifStatement() {
    /** 'if' '(' expression ')' '{' statement* '}' ('else' '{' statement* '}')? **/
    addText('<ifStatement>')
    var count = ifCounter
    ifCounter++
    checkToken('if')
    checkToken('(')
    compileExpression()
    checkToken(')')
    vmwriter.writeIf("IF_TRUE" + count)
    vmwriter.writeGoto("IF_FALSE" + count)
    vmwriter.writeLabel("IF_TRUE" + count)
    checkToken('{')
    compileStatement()
    checkToken('}')
    if (isToken('else')) {
      vmwriter.writeGoto("IF_END" + count)
      vmwriter.writeLabel("IF_FALSE" + count)
      checkToken('else')
      checkToken('{')
      compileStatement()
      checkToken('}')
      vmwriter.writeLabel("IF_END" + count)
    } else {
      vmwriter.writeLabel("IF_FALSE" + count)
    }
    addText('</ifStatement>')

  }

  function whileStatement() {
    /** 'while' '(' expression ')' '{' statement* '}' **/
    addText('<whileStatement>')
    var label1 = "WHILE_EXP" + whileCounter
    var label2 = "WHILE_END" + whileCounter
    whileCounter++
    vmwriter.writeLabel(label1)
    checkToken('while')
    checkToken('(')
    compileExpression()
    checkToken(')')
    vmwriter.writeArithmetic('~')
    vmwriter.writeIf(label2)
    checkToken('{')
    compileStatement()
    checkToken('}')
    vmwriter.writeGoto(label1)
    vmwriter.writeLabel(label2)
    addText('</whileStatement>')
  }

  function doStatement() {
    /** 'do' subroutineCall ';' **/
    addText('<doStatement>')
    checkToken('do')
    subroutineCall()
    checkToken(';')
    vmwriter.writePop('temp', 0)
    addText('</doStatement>')
  }

  function returnStatement() {
    /** 'return' expression? ';' **/
    addText('<returnStatement>')
    checkToken('return')
    if (not isToken(';')) {
      compileExpression()
    }
    checkToken(';')
    if (curSubRet == 'void') {
      vmwriter.writePush('constant', 0)

    }
    vmwriter.writeReturn()
    addText('</returnStatement>')
  }

  function compileExpression() {
    /** term [op term]* **/
    addText('<expression>')
    term()
    while (isOp()) {
      var op = tokenizer.curToken
      checkOp()
      term()
      vmwriter.writeArithmetic(op)
    }
    addText('</expression>')
  }

  function term() {
    /** integerConstant | stringConstant | keywordConstant | varName | varName '[' expression ']' | subroutineCall |
     * '(' expression ')' | unaryOp term **/
    addText('<term>')

    if (isIdentifier()) {
      tokenizer.advance()
      var temp = tokenizer.curToken
      tokenizer.reverse()
      if (temp.charAt(0) == '[') {
        var cur = tokenizer.curToken
        vmwriter.writePush(symTable.segmentOf(cur), symTable.indexOf(cur))
        checkIdentifier()
        checkToken('[')
        compileExpression()
        checkToken(']')
        vmwriter.writeArithmetic('+')
        vmwriter.writePop('pointer', 1)
        vmwriter.writePush('that', 0)
      } else if (temp.charAt(0) == '(' or temp.charAt(0) == '.') {
        subroutineCall()
      } else {
        var cur = tokenizer.curToken
        vmwriter.writePush(symTable.segmentOf(cur), symTable.indexOf(cur))
        checkIdentifier()
      }
    } else if (isType('INT_CONST') or isType('STRING_CONST') or isKeywordConstant()) {
      if (isType('INT_CONST')) {
        vmwriter.writePush('constant', tokenizer.intVal())
      } else if (isKeywordConstant()) {
        if (isToken('true')) {
          vmwriter.writePush('constant', 0)
          vmwriter.writeArithmetic('~')
        } else if (isToken('false') or (isToken('null'))) {
          vmwriter.writePush('constant', 0)
        } else if (isToken('this')) {
          vmwriter.writePush('pointer', 0)
        }
      } else {
        vmwriter.writePush('constant', tokenizer.curToken.length())
        vmwriter.writeCall('String.new', 1)
        for (i in 0|..|tokenizer.curToken.length()-1) {
          vmwriter.writePush('constant', tokenizer.curToken.charAt(i))
          vmwriter.writeCall('String.appendChar', 2)
        }
      }
      printCurrent()
    } else if (isUnaryOp()) {
      var op = tokenizer.curToken
      checkUnaryOp()
      term()
      vmwriter.writeUnaryOp(op)
    } else if (isToken('(')) {
      checkToken('(')
      compileExpression()
      checkToken(')')
    } else {
      error('integerConstant or stringConstant or keywordConstant or varName or subroutine or ( or unaryOp')
    }
    addText('</term>')
  }

  function subroutineCall() {
    /** subroutineName '(' expressionList ')' | (className | varName) '.' subroutineName '(' expressionList ')' **/
    var first = tokenizer.curToken
    var l : int
    var toAdd = 0
    checkIdentifier()
    if (isToken('(')) {
      vmwriter.writePush('pointer', 0)
      first = curClass + '.' + first
      checkToken('(')
      l = compileExpressionList() + 1
      checkToken(')')
    } else if (isToken('.')) {

      if (symTable.indexOf(first) != -1) {
        vmwriter.writePush(symTable.segmentOf(first), symTable.indexOf(first))
        first = symTable.findName(first).type
        toAdd++
      }
      checkToken('.')
      first += '.' + tokenizer.curToken
      checkIdentifier()
      checkToken('(')
      l = compileExpressionList() + toAdd
      checkToken(')')
    }
    vmwriter.writeCall(first, l)
  }

  function compileExpressionList() : int {
    /** (expression (',' expression)*)? **/
    addText('<expressionList>')
    var count = 0
    if (isToken(')')) {
    } else {
      do {
        compileExpression()
        count++
        if (isToken(',')) {
          checkToken(',')
        } else {
          break
        }
      } while (true)
    }
    addText('</expressionList>')
    return count
  }

  function checkOp() {
    /** '+' | '-' | '*' | '/' | '&' | '|' | '<' | '>' | '=' **/
    if (isOp()) {
      printCurrent()
    } else {
      error('op')
    }
  }

  function checkUnaryOp() {
    /** '-' | '~' **/
    if (isUnaryOp()) {
      printCurrent()
    } else {
      error('unary op')
    }
  }

  function checkKeywordConstant() {
    /** 'true' | 'false' | 'null' | 'this' **/
    if (isKeywordConstant()) {
      printCurrent()
    } else {
      error('keyword constant')
    }
  }

  function checkToken(type : String) {
    if (isToken(type)) {
      printCurrent()
    } else {
      throw new Exception('expected ' + type + ' but received ' + tokenizer.curToken)
    }
  }

  function checkIdentifier() {
    if (isIdentifier()) {
      printCurrent()
    } else {
      throw new Exception(tokenizer.curToken + ' is not an identifier')
    }

  }

  function error(type : String) {
    throw new Exception(tokenizer.curToken + ' doesn\'t match ' + type)
  }

  function isToken(type : String) : boolean {
    return tokenizer.curToken == type
  }

  function isType(type : String) : boolean {
    return tokenizer.curType == type
  }

  function isIdentifier() : boolean {
    return tokenizer.curType == 'IDENTIFIER'
  }

  function isOp() : boolean {
    return {'+', '-', '*', '/', '&', '|', '<', '>', '='}.contains(tokenizer.curToken.charAt(0))
  }

  function isUnaryOp() : boolean {
    return {'-', '~'}.contains(tokenizer.curToken.charAt(0))
  }

  function isKeywordConstant() : boolean {
    return {'true', 'false', 'null', 'this'}.contains(tokenizer.curToken)
  }

  function printCurrent() {
    if (tokenizer.curType == 'KEYWORD') {
      printKeyword(tokenizer.curToken)
    } else if (tokenizer.curType == 'SYMBOL') {
      printSymbol(tokenizer.curToken)
    } else if (tokenizer.curType == 'IDENTIFIER') {
      printIdentifier(tokenizer.curToken)
    } else if (tokenizer.curType == 'INT_CONST') {
      printInteger(tokenizer.intVal())
    } else if (tokenizer.curType == 'STRING_CONST') {
      printString(tokenizer.stringVal())
    }
    if (tokenizer.hasMoreTokens()) {
      tokenizer.advance()
    }
  }

  function printKeyword(keyword : String) {
    addText('<keyword> ' + keyword + ' </keyword>')
  }

  function printSymbol(symbol : String) {
    if (symbol.charAt(0) == '<') {
      symbol = '&lt;'
    } else if (symbol.charAt(0) == '>') {
      symbol = '&gt;'
    } else if (symbol.charAt(0) == '&') {
      symbol = '&amp;'
    }
    addText('<symbol> ' + symbol + ' </symbol>')
  }

  function printIdentifier(varName : String) {
    addText('<identifier> ' + varName + ' </identifier>')
  }

  function printInteger(integer : int) {
    addText('<integerConstant> ' + integer + ' </integerConstant>')
  }

  function printString(string : String) {
    addText('<stringConstant> ' + string + ' </stringConstant>')
  }

  function addText(data : String) : void {
    text += data + '\n'
    print(data)
  }

  function writeToFile(name : String) {
    var writer = new FileWriter(name + 'compiled.xml')
    writer.write(text)
    writer.close()
  }
}