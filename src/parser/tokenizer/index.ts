import { createError } from '../create-error'
import { Location } from '../../nodes'
import { operators } from './operators'
import { buildDebug } from '../../utils/debug'

const debug = buildDebug('tokenize')
const debugToken = debug.extend('token')
const debugRaw = debug.extend('raw')

export type TokenType =
  | 'ident'
  | 'symbol'
  | 'operator'
  | 'comment'
  | 'string'
  | 'numeric'
  | 'boolean'
  | 'operator-or-negative'

export interface Token {
  type: TokenType
  value: string
  loc: Location
}

const symbols = [';', ':', '.', ',', '/', '{', '}', '(', ')', '+', '-'] as const

const escapeRegExp = (s: string | RegExp) =>
  s instanceof RegExp ? s.source : s.replace(/[-\\^$*+?.()|[\]{}]/g, '\\$&')
export const getJoinedRegExp = (s: Array<string | RegExp>) =>
  s.map(escapeRegExp).join('|')

const splitters = [
  /* spaces         */ / +/,
  /* tabs           */ /\t+/,
  /* newline        */ '\n',
  /* line comment   */ /#[^\n]*|\/\/[^\n]*/,
  /* inline comment */ /(?:\/\*[\s\S]+?\*\/|\/\*[\s\S]*?\*\/)/,
  /* string         */ /"[^\n]*?"/,
  /* multiline str  */ /{"[\s\S]*?"}/,
  /* stupid         */ /(?:(\.)([A-z\d-_]+))/,
  /* stupid numeric */ /(?:((?:-?|-\s*)[\d]+[.]?[\d]*)\s*(ms|s|m|h|d|y)?)\s*(-)\s*(?:((?:\s*\(\s*)*)\s*(-?\s*[\d]+[.]?[\d]*)\s*(ms|s|m|h|d|y)?)/,
  /* numeric        */ /(?:(?<!(?:[\d]|(?:ms|s|m|h|d|y))\s*)-?\s*[\d]+[.]?[\d]*)/,
  ...operators,
  ...symbols,
  /* ident          */ /[A-z\d-_][A-z\d-_]+/,
]

const matchers = {
  symbols: new Set(symbols),
  operators: new Set(operators),
} as const

const reSplitter = new RegExp('(' + getJoinedRegExp(splitters) + ')')
// console.log(reSplitter);
export class Tokenizer {
  raw: string
  source: ReadonlyArray<string>

  constructor(raw: string /* opts: { keywords?: Array<string> } = {} */) {
    this.raw = raw
    const sourceTemp = raw.split(reSplitter)
    const newSource = []

    let cur = 0
    while (cur < sourceTemp.length) {
      const str = sourceTemp[cur++]
      if (str === undefined || str === '') {
        continue
      } else if (/^((?:\s*\(\s*)*)$/.test(str)) {
        newSource.push(
          ...str
            .split(/(\()|( +)|(\t+)|(\n)/)
            .filter((val) => val != undefined && val !== '')
        )
      } else {
        newSource.push(str)
      }
    }

    this.source = newSource

    if (debugRaw.enabled) {
      debugRaw(this.source.filter((t) => !/^\s*$/.test(t)))
    }
  }

  tokenize(): Array<Token> {
    const source = this.source
    const tokens = []

    let cur = 0

    let offset = 0
    let line = 1
    let column = 1

    while (cur < source.length) {
      const str = source[cur++]

      if (!str) {
        continue
      }

      // only whitespaces or tabs
      if (/^( |\t)/.test(str)) {
        offset += str.length
        column += str.length

        continue
      }

      // newline
      if (str === '\n') {
        offset += str.length
        line++
        column = 1

        continue
      }

      let err: string | undefined = undefined

      /** determine token start */

      const startOffset = offset
      const startLine = line
      const startColumn = column

      /** determine token type */

      let type: TokenType

      if ((matchers.symbols as Set<string>).has(str)) {
        type = 'symbol'
      } else if (/^(#|\/\/|\/\*|\/\*)/.test(str)) {
        type = 'comment'
        if (/^(\/\*)/.test(str)) {
          const lines = str.split('\n')
          line += lines.length - 1
          column = lines[lines.length - 1].length - (str.length - 1)
        }
      } else if ((matchers.operators as Set<string>).has(str)) {
        type = 'operator'
      } else if (/^(true|false)$/.test(str)) {
        type = 'boolean'
      } else if (str.startsWith('"')) {
        type = 'string'

        if (!str.endsWith('"') || str === '"') {
          err =
            'invalid token (string may have newlines inside normal quotes, use `{" "}`)'
        }
      } else if (str.startsWith('{"')) {
        type = 'string'

        // string can have newline inside
        const lines = str.split('\n')
        line += lines.length - 1
        column = lines[lines.length - 1].length - (str.length - 1)
      } else if (
        /^(?:((?:-?|-\s*)[\d]+[.]?[\d]*)\s*(ms|s|m|h|d|y)?)\s*(-)\s*(?:((?:\s*\(\s*)*)\s*(-?\s*[\d]+[.]?[\d]*)\s*(ms|s|m|h|d|y)?)$/.test(
          str
        )
      ) {
        continue
      } else if (/^(?:(\.)([A-z\d-_]+))$/.test(str)) {
        continue
      } else if (/^-?\s*[\d.]+$/.test(str)) {
        type = 'numeric'
      } else {
        type = 'ident'

        if (!/^[A-z\d-_]+/.test(str)) {
          err = 'invalid token'
        }
      }

      /** update position */

      offset += str.length
      column += str.length

      /** determine token end */

      const endOffset = offset - 1
      const endLine = line
      const endColumn = column - 1

      if (err) {
        throw createError(
          this.raw,
          err,
          {
            offset: startOffset,
            line: startLine,
            column: startColumn,
          },
          {
            offset: endOffset,
            line: endLine,
            column,
          }
        )
      }

      // TODO: implement comment handling
      if (type === 'comment') continue

      const token = {
        type,
        value: str,
        loc: {
          start: { offset: startOffset, line: startLine, column: startColumn },
          end: { offset: endOffset, line: endLine, column: endColumn },
        },
      }

      if (debugToken.enabled) {
        debugToken(`${token.type}: ${token.value}`)
      }

      tokens.push(token)
    }

    return tokens as Array<Token>
  }
}
