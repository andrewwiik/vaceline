import fs from 'fs'
import path from 'path'

import { parse } from '../core'
import { hydrate } from '../core/hydrate'
import { BaseNode } from '../core/nodes'

describe('hydrate', () => {
  const code = fs.readFileSync(
    path.resolve('__tests__/__fixture__/rough.vcl'),
    'utf8'
  )
  // const rawAst = fs.readFileSync(path.resolve('__tests__/__fixture__/test_ast.json'), 'utf8')

  it('should', () => {
    const ast = parse(code)
    const hydrated = hydrate(JSON.stringify(ast))

    expect(hydrated).toBeInstanceOf(BaseNode)
    expect(JSON.stringify(hydrated)).toMatch(JSON.stringify(ast))
  })
})
