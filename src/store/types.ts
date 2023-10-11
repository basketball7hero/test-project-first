import type { TAnyObject } from '../types';

export type TDispatch = <A>(action: A) => any;

export type TAction<P = void, M = void> = {
  type: string;
  payload: P;
  meta: M;
};

export type TAnyAction = TAction<any, any>;

export type TActionCreator<P = void, M = void> = (payload: P, meta: M) => TAction<P, M>;

export type TAnyActionCreator = TActionCreator<any, any>;

export type TThunkCreator<P = void, M = void, R = void> = (payload: P, meta: M) => R;

export type TAnyThunkCreator = TThunkCreator<any, any, any>;

export type TMakeActionCreator = (type: string) => TAnyActionCreator;

export type TModelReducers<
  TState extends TAnyObject,
  TActions extends Record<string, TAnyActionCreator | TAnyThunkCreator>,
> = {
  [K in keyof TActions]: TActions[K] extends TAnyActionCreator
    ? (state: TState, action: ReturnType<TActions[K]>) => TState
    : void;
};

export type TModelReduce<TState extends TAnyObject> = (state: TState | undefined, action: TAnyAction) => TState;

export type TAnyReduce = TModelReduce<TAnyObject>;

export type PassArgumentsToAction<F extends (...args: any[]) => any> = F extends (a: infer A, b: infer B) => any
  ? TAction<A, B>
  : any;

export type TGetRootState = <TRootState extends TAnyObject>() => TRootState;

export type TThunk<
  TState extends TAnyObject,
  Action extends TAnyThunkCreator = TAnyThunkCreator,
  ReturnValue = ReturnType<Action>,
> = (
  handlers: {
    dispatch: TDispatch;
    getRootState: TGetRootState;
    getState: () => TState;
  },
  action: PassArgumentsToAction<Action>,
) => ReturnValue;

export type TModelThunks<
  TState extends TAnyObject,
  TActions extends Record<string, TAnyActionCreator | TAnyThunkCreator>,
> = {
  [K in keyof TActions]: TActions[K] extends TAnyThunkCreator ? TThunk<TState, TActions[K]> : void;
};

export type TModelSelectors<TState extends TAnyObject> = { [K in keyof TState]: (state: any) => TState[K] };

export type TModelOptions<
  TId extends string,
  TStatic extends TAnyObject,
  TState extends TAnyObject,
  TUtils extends TAnyObject,
  TActions extends Record<string, TAnyActionCreator | TAnyThunkCreator>,
> = {
  id: TId;
  staticData?: TStatic;
  defaultState?: TState;
  utils?: ((ctx: { id: TId; staticData: TStatic; defaultState: TState }) => TUtils) | TUtils;
  reducers?:
    | ((ctx: {
    id: TId;
    staticData: TStatic;
    defaultState: TState;
    utils: TUtils;
  }) => Partial<TModelReducers<TState, TActions>>)
    | Partial<TModelReducers<TState, TActions>>;
  thunks?:
    | ((ctx: {
    id: TId;
    staticData: TStatic;
    defaultState: TState;
    utils: TUtils;
    actions: TActions;
    selectors: TModelSelectors<TState>;
  }) => Partial<TModelThunks<TState, TActions>>)
    | Partial<TModelThunks<TState, TActions>>;
};

export type TModel<
  TId extends string,
  TStatic extends TAnyObject,
  TState extends TAnyObject,
  TUtils extends TAnyObject,
  TActions extends Record<string, TAnyActionCreator>,
> = {
  id: TId;
  staticData: TStatic;
  defaultState: TState;
  utils: TUtils;
  actions: TActions;
  reduce: TModelReduce<TState>;
  thunks: TModelThunks<TState, TActions>;
  selectors: TModelSelectors<TState>;
};
