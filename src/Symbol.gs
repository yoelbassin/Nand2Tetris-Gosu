class Symbol {
  var name_ : String
  var type_ : String
  var kind_ : String
  var index_ : int

  construct(name_val : String, type_val : String, kind_val : String, index_val : int){
    this.name_ = name_val
    this.type_ = type_val
    this.kind_ = kind_val
    this.index_ = index_val
  }

  property get name(): String{
    return this.name_;
  }

  property get type(): String{
    return this.type_;
  }

  property get kind(): String{
    return this.kind_;
  }

  property get index(): int{
    return this.index_
  }

  property get segment(): String{
    if (this.kind_ == 'VAR'){
      return 'local'
    }
    else if (this.kind_ == 'ARG'){
      return 'argument'
    }
    else if (this.kind_ == 'FIELD'){
      return 'this'
    } else if (this.kind_ == 'STATIC'){
      return 'static'
    }
    else {
      return this.kind_
    }
  }



}