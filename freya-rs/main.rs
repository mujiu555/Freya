#![allow(unused)]

use pest::{
    Parser,
    iterators::{Pair, Pairs},
};
use pest_derive::Parser;

#[derive(Parser)]
#[grammar = "freya.pest"]
struct Freya;

// For the development of the evaluator later, we need to switch to Arena or Rc lifetimes, 
// but need to archive the current very simple implementation.
#[derive(Debug)]
enum Expr {
    Identifier(String),
    Integer(i32),
    Hole,
    String(String),
    List(Vec<Expr>),
}

impl Expr {
    fn parse(pair: Pair<Rule>) -> Expr {
        match pair.as_rule() {
            Rule::WHITESPACE | Rule::COMMENT | Rule::atom | Rule::expr | Rule::toplevels => {
                unreachable!()
            }
            Rule::integer => Expr::Integer(str::parse(pair.as_str()).unwrap()),
            Rule::identifier | Rule::string => Expr::String(pair.as_str().to_owned()),
            Rule::hole => Expr::Hole,
            Rule::list => Expr::List(pair.into_inner().map(Expr::parse).collect()),
        }
    }
}

fn main() {
    let input = r##"
        (display 10)
    "##;
    let pairs = Freya::parse(Rule::toplevels, input).unwrap();
    let exprs = pairs.map(Expr::parse).collect::<Vec<_>>();
    println!("{:?}", &exprs);
}
