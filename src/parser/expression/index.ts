import { d, b, NodeWithLoc } from '../../nodes'
import { isToken } from '../../utils/token'

import { Token } from '../tokenizer'
import { Parser } from '..'
import { parseOperatorExpr } from './operator'
import { parseHumbleExpr } from './humble'
import { parseIdentifier } from './identifier'

// import { buildDebug } from '../../utils/debug'
// const debug = buildDebug('parser', 'expression')

export interface Stack<T> {
  [I: number]: T
  push: Array<T>['push']
  pop: Array<T>['pop']
  length: Array<T>['length']
}

export const parseExpr = (
  p: Parser,
  token: Token = p.read(),
  shortcut = false
): NodeWithLoc<d.Expression> => {
  const expr = parseOperatorExpr(p, token)

  if (shortcut) return expr

  const loc = p.startNode()

  if (isToken(token, 'symbol', ';')) {
    return expr
  }

  let backup = p.getCursor()

  const buf = [expr]

  let nextToken = p.peek()

  while (nextToken) {
    p.take()

    if (isToken(nextToken, 'symbol', ';')) {
      break
    }

    if (isToken(nextToken, 'symbol', '+')) {
      nextToken = p.read()
    }

    try {
      const expr = parseHumbleExpr(p, nextToken)
      buf.push(expr)
      backup = p.getCursor()
    } catch (err) {
      if (err instanceof SyntaxError) {
        break
      } else {
        throw err
      }
    }

    nextToken = p.peek()
  }

  // backtrack to the backed-up cursor
  p.jumpTo(backup)

  // the next token wasn't an expression
  if (buf.length === 1) {
    return expr
  }

  return p.finishNode(b.buildConcatExpression(buf, loc))
}

export const parseArgExpr = (
  p: Parser,
  token: Token = p.read()
): NodeWithLoc<d.Expression> => {
  let ident = undefined
  let expr = undefined

  const loc = p.startNode()

  const peeked = p.peek()

  if (isToken(peeked, 'operator', '=')) {
    ident = parseIdentifier(p, token)
    p.validateToken(p.read(), 'operator', '=')
    expr = parseExpr(p, p.read(), true)
  } else {
    expr = parseOperatorExpr(p, token)
  }

  if (isToken(token, 'symbol', ';')) {
    return expr
  }

  let backup = p.getCursor()

  const buf = [expr]

  let nextToken = p.peek()
  while (nextToken) {
    if (isToken(nextToken, 'symbol', ',')) {
      break
    }

    if (isToken(nextToken, 'symbol', ')')) {
      break
    }

    p.take()

    if (isToken(nextToken, 'symbol', ',')) {
      break
    }

    if (isToken(nextToken, 'symbol', '+')) {
      nextToken = p.read()
    }

    try {
      const expr = parseHumbleExpr(p, nextToken)
      buf.push(expr)
      backup = p.getCursor()
    } catch (err) {
      if (err instanceof SyntaxError) {
        break
      } else {
        throw err
      }
    }

    nextToken = p.peek()
  }

  // backtrack to the backed-up cursor
  p.jumpTo(backup)

  // the next token wasn't an expression
  if (buf.length === 1) {
    return p.finishNode(b.buildArgumentDefinition(expr, loc, ident))
  }
  return p.finishNode(
    b.buildArgumentDefinition(b.buildConcatExpression(buf, loc), loc, ident)
  )
}
