uses java.io.File
uses java.io.FileWriter

class CompilationEngine {

  var tokenizer : Tokenizer

  var text : String = ''

  construct(path : String) {
    var readFile = new File(path)
    if (readFile.isDirectory()) {
      foreach (var file in readFile.listFiles()) {
        var fname = String.valueOf(file)
        if (fname.split('\\\\')[fname.split('\\\\').length - 1].split('\\.')[1] == 'jack') {
          print(fname)
          tokenizer = new Tokenizer(fname)
          compileClass()
          writeToFile(fname.split('\\.')[0])
          text = ''
        }
      }
    } else {
      var fname = String.valueOf(readFile)
      print(fname)
      tokenizer = new Tokenizer(fname)
      compileClass()
      writeToFile(fname.split('\\.')[0])
    }

  }


  function compileClass() {
    /** 'class' classname '{' classVarDec* subroutineDec* '}' **/
    addText('<class>')


    checkToken('class')

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
    printCurrent()

    compileType()

    do {
      checkIdentifier()

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

  function compileType() {
    /** 'int | char | boolean | className **/
    if (not isToken('int') and not isToken('char') and not isToken('boolean') and not isIdentifier()) {
      error('int or char or boolean or classname')
    }
    printCurrent()
  }

  function compileSubroutineDec() {
    /** ('constructor' | 'function' | 'method') ('void' | type) subroutineName '(' parameterList ')' subroutineBody **/
    addText('<subroutineDec>')

    if (not isToken('constructor') and not isToken('function') and not isToken('method')) {
      error('constructor or function or method')
    }
    printCurrent()
    if (not isToken('void')) {
      compileType()
    } else {
      printCurrent()
    }
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
        compileType()
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

    compileStatement()

    checkToken('}')
    addText('</subroutineBody>')
  }

  function varDec() {
    /** 'var' type varName (',' varName)* ';' **/
    addText('<varDec>')

    checkToken('var')

    compileType()

    do {

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
    checkIdentifier()
    if (isToken('[')) {
      checkToken('[')
      compileExpression()
      checkToken(']')
    }
    checkToken('=')
    compileExpression()
    checkToken(';')
    addText('</letStatement>')
  }

  function ifStatement() {
    /** 'if' '(' expression ')' '{' statement* '}' ('else' '{' statement* '}')? **/
    addText('<ifStatement>')
    checkToken('if')
    checkToken('(')
    compileExpression()
    checkToken(')')
    checkToken('{')
    compileStatement()
    checkToken('}')
    if (isToken('else')) {
      checkToken('else')
      checkToken('{')
      compileStatement()
      checkToken('}')
    }
    addText('</ifStatement>')

  }

  function whileStatement() {
    /** 'while' '(' expression ')' '{' statement* '}' **/
    addText('<whileStatement>')
    checkToken('while')
    checkToken('(')
    compileExpression()
    checkToken(')')
    checkToken('{')
    compileStatement()
    checkToken('}')
    addText('</whileStatement>')
  }

  function doStatement() {
    /** 'do' subroutineCall ';' **/
    addText('<doStatement>')
    checkToken('do')
    subroutineCall()
    checkToken(';')
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
    addText('</returnStatement>')
  }

  function compileExpression() {
    /** term [op term]* **/
    addText('<expression>')
    term()
    if (isOp()) {
      checkOp()
      term()
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
        checkIdentifier()
        checkToken('[')
        compileExpression()
        checkToken(']')
      } else if (temp.charAt(0) == '(' or temp.charAt(0) == '.') {
        subroutineCall()
      } else checkIdentifier()
    } else if (isType('INT_CONST') or isType('STRING_CONST') or isKeywordConstant()) {
      printCurrent()
    } else if (isUnaryOp()) {
      checkUnaryOp()
      term()
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
    checkIdentifier()
    if (isToken('(')) {
      checkToken('(')
      compileExpressionList()
      checkToken(')')
    } else if (isToken('.')) {
      checkToken('.')
      checkIdentifier()
      checkToken('(')
      compileExpressionList()
      checkToken(')')
    }
  }

  function compileExpressionList() {
    /** (expression (',' expression)*)? **/
    addText('<expressionList>')
    if (isToken(')')) {
    } else {
      do {
        compileExpression()
        if (isToken(',')) {
          checkToken(',')
        } else {
          break
        }
      } while (true)
    }
    addText('</expressionList>')
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