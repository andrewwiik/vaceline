import * as d from './defs'

export interface Nodes {
  Program: d.Program
  BooleanLiteral: d.BooleanLiteral
  StringLiteral: d.StringLiteral
  OperatorLiteral: d.OperatorLiteral
  MultilineLiteral: d.MultilineLiteral
  DurationLiteral: d.DurationLiteral
  NumericLiteral: d.NumericLiteral
  Identifier: d.Identifier
  Ip: d.Ip
  Member: d.Member
  ValuePair: d.ValuePair
  BooleanExpression: d.BooleanExpression
  UnaryExpression: d.UnaryExpression
  FunCallExpression: d.FunCallExpression
  ConcatExpression: d.ConcatExpression
  BinaryExpression: d.BinaryExpression
  LogicalExpression: d.LogicalExpression
  ExpressionStatement: d.ExpressionStatement
  IncludeStatement: d.IncludeStatement
  VCLVersionStatement: d.VCLVersionStatement
  ImportStatement: d.ImportStatement
  CallStatement: d.CallStatement
  DeclareStatement: d.DeclareStatement
  AddStatement: d.AddStatement
  SetStatement: d.SetStatement
  NewStatement: d.NewStatement
  UnsetStatement: d.UnsetStatement
  ReturnStatement: d.ReturnStatement
  ErrorStatement: d.ErrorStatement
  RestartStatement: d.RestartStatement
  SyntheticStatement: d.SyntheticStatement
  LogStatement: d.LogStatement
  IfStatement: d.IfStatement
  SubroutineStatement: d.SubroutineStatement
  AclStatement: d.AclStatement
  BackendDefinition: d.BackendDefinition
  ProbeDefinition: d.ProbeDefinition
  BackendStatement: d.BackendStatement
  ProbeStatement: d.ProbeStatement
  TableDefinition: d.TableDefinition
  TableStatement: d.TableStatement
  ArgumentDefinition: d.ArgumentDefinition
}
