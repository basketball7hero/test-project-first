export type TAnyObject = Record<string, any>;
export type TEmptyObject = {};
export type TSortDirection = 'asc' | 'desc';
export type TSortItem<P extends string = string> = {
  direction: TSortDirection;
  property: P;
};
export type TFunction = (...args: any[]) => any;
export type TEmptyFunction = () => void;
export type TAwaited<T> = T extends PromiseLike<infer U> ? U : T;
