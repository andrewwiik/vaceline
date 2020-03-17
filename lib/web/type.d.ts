import { BaseNode } from '../../core/nodes'

export type Result =
  | { type: 'success'; code: string; ast: BaseNode }
  | { type: 'error'; message: string }
