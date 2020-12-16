import { Parser } from '..'
import { Stack } from '.'
import { d, b, NodeWithLoc, BaseNode } from '../../nodes'
import * as ops from '../tokenizer/operators'
import { Token } from '../tokenizer'
import { isToken } from '../../utils/token'
import { parseHumbleExpr } from './humble'
import { parseExpr } from './index'

export const parseOperatorExpr = (
  p: Parser,
  token: Token = p.read(),
  shortcut = false,
  skipGrouping = false
): NodeWithLoc<d.Expression> => {
  let groupBackup = p.getCursor() - 1
  const expr = parseHumbleExpr(p, token)

  if (shortcut) return expr

  if (isToken(token, 'symbol', ';')) {
    return expr
  }

  let backup = p.getCursor()

  type OperatorToken = Token & {
    type: 'operator'
    precedence: number
    isBinary: boolean
  }

  const rpn: Array<NodeWithLoc<d.Expression> | OperatorToken> = [expr]
  const opStack: Stack<OperatorToken> = []

  let op: OperatorToken | null
  // covert expression sequence into rpn
  while ((op = p.peek() as OperatorToken | null)) {
    const isBinary = ops.binary.has(op.value)
    const isLogical = !isBinary && ops.logical.has(op.value)
    const isGrouping =
      skipGrouping === true ? false : ops.grouping.has(op.value)

    if (!isBinary && !isLogical && !isGrouping) break

    p.take()

    op.precedence = ops.getPrecedence(op.value)
    op.isBinary = isBinary
    if (!isGrouping) {
      while (op.precedence >= (opStack[opStack.length - 1] || {}).precedence) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        rpn.push(opStack.pop()!)
      }
      opStack.push(op)
    } else {
      rpn.pop()
    }

    try {
      if (isGrouping) {
        p.jumpTo(groupBackup)
        rpn.push(parseExpr(p, undefined, false, true))
        groupBackup = p.getCursor() + 1
      } else {
        rpn.push(parseHumbleExpr(p))
      }
    } catch (err) {
      if (err instanceof SyntaxError) {
        p.jumpTo(backup)
        break
      }
      throw err
    }

    backup = p.getCursor()
  }

  while (opStack.length) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    rpn.push(opStack.pop()!)
  }
  // calculate rpn
  const stack: Stack<NodeWithLoc<d.Expression>> = []

  for (let i = 0; i < rpn.length; i++) {
    const item = rpn[i]
    if (item instanceof BaseNode) {
      stack.push(item)
      continue
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const right = stack.pop()!
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const left = stack.pop()!

    const builder = item.isBinary
      ? b.buildBinaryExpression
      : b.buildLogicalExpression
    const expr = builder(left, right, item.value) as NodeWithLoc<
      d.BinaryExpression | d.LogicalExpression
    >

    expr.loc = { start: left.loc.start, end: right.loc.end }

    stack.push(expr)
  }

  if (stack.length !== 1) {
    throw new Error()
  }

  return stack[0]
}
