var T = new Translator()
T.push("constant", "17")
T.push("constant", "17")
T.eq()
T.push("constant", "17")
T.push("constant", "16")
T.eq()
T.push("constant", "16")
T.push("constant", "17")
T.eq()
T.push("constant", "892")
T.push("constant", "891")
T.lt()
T.push("constant", "891")
T.push("constant", "892")
T.lt()
T.push("constant", "891")
T.push("constant", "891")
T.lt()
T.push("constant", "32767")
T.push("constant", "32766")
T.gt()
T.push("constant", "32766")
T.push("constant", "32767")
T.gt()
T.push("constant", "32766")
T.push("constant", "32766")
T.gt()
T.push("constant", "57")
T.push("constant", "31")
T.push("constant", "53")
T.add()
T.push("constant", "112")
T.sub()
T.neg()
T._and()
T.push("constant", "82")
T._or()
T._not()
T.writeToFile('test.asm')