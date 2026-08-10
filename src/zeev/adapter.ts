import type { TaskContext, ZeevElements, ZeevFieldName } from './types';

export interface ZeevAdapterContract {
  getElements(): ZeevElements;
  getCurrentTask(): TaskContext;
  getField(name: ZeevFieldName): Element | null;
  getFields(name: ZeevFieldName): readonly Element[];
}

export const zeevAdapterContract: Readonly<{
  implemented: false;
  phase: 2;
}> = Object.freeze({
  implemented: false,
  phase: 2,
});
