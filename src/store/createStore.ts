import type { Reducer } from 'redux';
import { applyMiddleware, combineReducers, legacy_createStore as createStore } from 'redux';
import thunk from 'redux-thunk';

export default <Reducers extends Record<string, Reducer<any, any>>>(reducers: Reducers) =>
  createStore(combineReducers<Reducers, any>(reducers), applyMiddleware(thunk));
