name:   freya
suffix: fry 



EBNF convention 

- `\*`        repeat 
- `\+`        repeat at least one 
- `()`        group
- `..`        unicode range 
- `U+0000`    unicode code point  
- `::=`       define rule 
- `<expr>`    non terminal symbol 
- `""`        string literal

```BNF
WHITESPACE ::= <WHITE_SPACE>+
COMMENT    ::= ";" (U+0000..U+0009 | U+000B..U+FFFF)* "\n"

<integer>    ::= <ASCII_DIGIT>+
<identifier> ::= <ASCII_ALPHA_LOWER> (<ASCII_ALPHA_LOWER> | <ASCII_DIGIT> | "-")*
<hole>       ::= "_"

<string>     ::= "\"" (U+0000..U+0009 | U+000B..U+0021 | U+0023..U+FFFF)* "\""

<expr>       ::= <atom> | <list>
<atom>       ::= <hole> | <identifier> | <integer> | <string>
<list>       ::= "(" <expr>* ")"

<toplevels>  ::= <expr>*
```