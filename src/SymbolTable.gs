class SymbolTable {
  var classSymbolTable : ArrayList<Symbol>
  var subroutineSymbolTable : ArrayList<Symbol>

  construct() {
    classSymbolTable = new ArrayList<Symbol>()
  }

  function startSub() {
    subroutineSymbolTable = new ArrayList<Symbol>()
  }

  function define(name : String, type : String, kind : String) {
    kind = kind.toUpperCase()
    var symbol_ = new Symbol(name, type, kind, varCount(kind))
    if (kind == 'STATIC' or kind == 'FIELD') {
      classSymbolTable.add(symbol_)
    } else if (kind == 'ARG' or kind == 'VAR') {
      subroutineSymbolTable.add(symbol_)
    }
  }

  function varCount(kind : String) : int {
    var sum = 0
    for (i in subroutineSymbolTable) {
      if (i.kind == kind) {
        sum++
      }
    }
    for (i in classSymbolTable) {
      if (i.kind == kind) {
        sum++
      }
    }
    return sum
  }

  function kindOf(name : String) : String{
    var symbol = findName(name)
    return symbol.kind
  }

  function segmentOf(name : String) : String{
    var symbol = findName(name)
    return symbol.segment
  }

  function indexOf(name : String) : int {
    for (i in subroutineSymbolTable) {
      if (i.name == name) {
        return i.index
      }
    }
    for (i in classSymbolTable) {
      if (i.name == name) {
        return i.index
      }
    }
    return -1
  }

  function findName(name : String) : Symbol {
    for (i in subroutineSymbolTable) {
      if (i.name == name) {
        return i
      }
    }
    for (i in classSymbolTable) {
      if (i.name == name) {
        return i
      }
    }
    print('name: ' + name)
    print(this.toString())
    throw new Exception("cant find")
  }

  @Override
  function toString() : String {
    var text = 'classSymbolTable:\n'
    for (i in classSymbolTable) {
      text += i.name + ' ' + i.type + ' ' + i.kind + '\n'
    }
    text += 'subroutineSymbolTable:\n'
    for (i in subroutineSymbolTable) {
      text += i.name + ' ' + i.type + ' ' + i.kind + '\n'
    }
    return text
  }

}