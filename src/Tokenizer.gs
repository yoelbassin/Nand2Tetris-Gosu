uses java.io.File

class Tokenizer {

  var letters = {'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'}
  var symbols = {'{', '}', '(', ')', '[', ']', '.', ',', ';', '+', '-', '*', '/', '&', '|', '<', '>', '=', '~'}
  var digits = {'0', '1', '2', '3', '4', '5', '6', '7', '8', '9'}

  static var keywords = {"class", "constructor", "function", "method", "field", "static", "var", "int", "char", "boolean",
      "void", "true", "false", "null", "this", "let", "do", "if", "else", "while", "return"}

  var tokensPointer : int = -1;
  var currentToken : String;
  var currentTokenType : String;

  var createdTokens = new ArrayList<String>()

  var integerRegex = "[0-9]+";
  var stringRegex = "\"[^\"\n]*\"";

  construct(path : String) {

    run(path)

  }

  function run(path : String) {
    var file = new File(path)
    var reader = new Scanner(file)
    var data = ''
    while (reader.hasNextLine()) {
      data += reader.nextLine() + '\n';
    }


    var pointer = 0
    var buffer = ''
    while (pointer < data.length()) {
      var cur = data[pointer]
      if (pointer + 1 < data.length() and data[pointer] == '/' and (data[pointer + 1] == '/' or data[pointer + 1] == '*')) {
        if (data[pointer + 1] == '/') {
          while (cur != '\n') {
            pointer++
            cur = data[pointer]
          }
        } else {
          while (cur != '*' or (pointer < data.length() and data[pointer + 1] != '/')) {
            pointer++
            cur = data[pointer]
          }
          pointer += 2
        }
      } else if (letters.contains(Character.toUpperCase(cur)) or cur == '_') {
        while (letters.contains(Character.toUpperCase(cur)) or cur == '_' or digits.contains(cur)) {
          buffer += cur
          pointer++
          cur = data[pointer]
        }
      } else if (digits.contains(cur)) {
        while (digits.contains(cur)) {
          buffer += cur
          pointer++
          cur = data[pointer]
        }
      } else if (symbols.contains(cur)) {
        buffer += cur
        pointer++
      } else if (cur == '"') {
        do {
          buffer += cur
          pointer++
          cur = data[pointer]
        }
        while (cur != '"')
        buffer += cur
        pointer++
        cur = data[pointer]
      } else {
        pointer++
      }
      if (!{'', ' ', '\n'}.contains(buffer))
        createdTokens.add(buffer)
      buffer = ''
    }

    advance()

  }

  property get curToken(): String{
    return currentToken
  }

  property get curType(): String {
    return currentTokenType
  }

  function hasMoreTokens() : boolean {
    return tokensPointer < createdTokens.size() - 1
  }

  function reverse() {
    tokensPointer--
    currentToken = createdTokens.get(tokensPointer)

    if (keywords.contains(currentToken)) {
      currentTokenType = 'KEYWORD'
    } else if (symbols.contains(currentToken)) {
      currentTokenType = 'SYMBOL'
    } else if (currentToken.matches(integerRegex)) {
      currentTokenType = 'INT_CONST'
    } else if (currentToken.matches(stringRegex)) {
      currentTokenType = 'STRING_CONST'
    } else {
      currentTokenType = 'IDENTIFIER'
    }
  }

  function advance() {
    tokensPointer++
    currentToken = createdTokens.get(tokensPointer)

    if (keywords.contains(currentToken)) {
      currentTokenType = 'KEYWORD'
    } else if (symbols.contains(currentToken.charAt(0))) {
      currentTokenType = 'SYMBOL'
    } else if (currentToken.matches(integerRegex)) {
      currentTokenType = 'INT_CONST'
    } else if (currentToken.matches(stringRegex)) {
      currentTokenType = 'STRING_CONST'
    } else {
      currentTokenType = 'IDENTIFIER'
    }
  }

  function keyword() : String {
    if (currentTokenType == 'KEYWORD') {
      return currentToken
    } else {
      throw new Exception(currentToken + ' is not a keyword');
    }
  }

  function symbol() : char {
    if (currentTokenType == 'SYMBOL') {
      return currentToken.charAt(0);
    } else {
      throw new Exception(currentToken + ' is not a symbol');
    }
  }

  function identifier() : String {
    if (currentTokenType == 'IDENTIFIER') {
      return currentToken;
    } else {
      throw new Exception(currentToken + " is not an identifier");
    }
  }

  function intVal() : int {
    if (currentTokenType == 'INT_CONST') {
      return Integer.parseInt(currentToken);
    } else {
      throw new IllegalStateException(currentToken + " is not an integer constant");
    }
  }

  function stringVal() : String {
    if (currentTokenType == 'STRING_CONST') {
      return currentToken.substring(1, currentToken.length() - 1);
    } else {
      throw new IllegalStateException(currentToken + " is not a string constant");
    }
  }

}