import { BaseNode } from '../../core/nodes/src'

export type Result =
  | { type: 'success'; code: string; ast: BaseNode }
  | { type: 'error'; message: string }
