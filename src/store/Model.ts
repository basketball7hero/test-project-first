import isFunction from 'lodash/isFunction';

import type { TAnyObject, TEmptyObject } from '../types';
import type {
  TModelOptions,
  TModelThunks,
  TModelSelectors,
  TModelReduce,
  TModelReducers,
  TModel,
  TAnyActionCreator,
  TAnyThunkCreator,
  TMakeActionCreator,
  TGetRootState,
  TDispatch,
} from './types';

const Model = <
  TId extends string,
  TStatic extends TAnyObject = TEmptyObject,
  TState extends TAnyObject = TEmptyObject,
  TUtils extends TAnyObject = TEmptyObject,
  TActions extends Record<string, TAnyActionCreator | TAnyThunkCreator> = TEmptyObject,
>(
  options: TModelOptions<TId, TStatic, TState, TUtils, TActions>,
): TModel<TId, TStatic, TState, TUtils, TActions> => {
  const { id } = options;

  const staticData = (options.staticData ?? {}) as TStatic;
  const defaultState = (options.defaultState ?? {}) as TState;

  const selectors = Object.keys(defaultState).reduce(
    (result, key) => ({ ...result, [key]: (state) => state[id][key] }),
    {} as TModelSelectors<TState>,
  );

  const utils = isFunction(options.utils)
    ? options.utils({ id, staticData, defaultState })
    : ((options.utils ?? {}) as TUtils);

  const reducers = isFunction(options.reducers)
    ? options.reducers({ id, staticData, defaultState, utils })
    : ((options.reducers ?? {}) as TModelReducers<TState, TActions>);

  const makeActionType = (type: string) => `${id}/${type}`;

  const makeActionCreator: TMakeActionCreator = (type) => (payload, meta) => ({
    type: makeActionType(type),
    payload,
    meta,
  });

  const actions = Object.keys(reducers).reduce(
    (result, actionName) => ({
      ...result,
      [actionName]: makeActionCreator(actionName),
    }),
    {} as TActions,
  );

  const prefixedReducers = Object.entries(reducers).reduce(
    (result, [actionName, reducer]) => ({
      ...result,
      [makeActionType(actionName)]: reducer,
    }),
    {} as TModelReducers<TState, any>,
  );

  const reduce: TModelReduce<TState> = (state = defaultState, action) =>
    prefixedReducers[action.type]?.(state, action) ?? state;

  const thunks = Object.entries(
    isFunction(options.thunks)
      ? options.thunks({
        id,
        staticData,
        defaultState,
        utils,
        actions,
        selectors,
      })
      : options.thunks ?? {},
  ).reduce((result, [actionName, handler]) => {
    const actionCreator = makeActionCreator(actionName);
    return {
      ...result,
      [actionName]: (payload?: any, meta?: any) => (dispatch: TDispatch, getRootState: TGetRootState) => {
        const getState = () => (getRootState()[id] ?? defaultState) as TState;
        return handler({ dispatch, getRootState, getState }, dispatch(actionCreator(payload, meta)));
      },
    };
  }, {} as TModelThunks<TState, TActions>);

  Object.assign(actions, thunks);

  return {
    id,
    staticData,
    defaultState,
    utils,
    actions,
    reduce,
    thunks,
    selectors,
  };
};

export default Model;
