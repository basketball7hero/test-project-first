import identity from 'lodash/identity';
import isFunction from 'lodash/isFunction';
import pick from 'lodash/pick';
import pickBy from 'lodash/pickBy';
import uniqueId from 'lodash/uniqueId';

import type { TSortItem, TEmptyObject, TAnyObject } from '../types';
import createDebouncedCall from '../utils/createDebouncedCall';

import Model from './Model';
import type { TActionCreator, TThunkCreator, TModelReducers, TModelThunks } from './types';
import {TResponse} from '../api/xhr';

export const instanceIdDoesNotMatchError = new Error('instanceIdDoesNotMatch');

type TItemId = number | 'new' | string;

type TListModelItem = {
  id: TItemId;
};

type TItemState = Record<string, boolean>;

type TListModelExt = {
  actions?: TEmptyObject;
  state?: TEmptyObject;
  utils?: TEmptyObject;
};

type TListModelState<Item extends TListModelItem, Ext extends TListModelExt> = {
  sort: TSortItem;
  page: number;
  limit: number;
  items: Item[];
  total: number;
  filters: TEmptyObject;
  itemsState: Record<string, TItemState>;
  itemsIsLoading: boolean;
} & Ext['state'];

type TListModelUtils<
  Item extends TListModelItem,
  Ext extends TListModelExt,
  State extends TListModelState<Item, Ext> = TListModelState<Item, Ext>,
> = {
  prepareApiPaging: (page: State['page'], limit: State['limit'], filters: State['filters']) => any;
  prepareApiFilters: (filters: State['filters']) => any;
  prepareApiQueryFilters: (filters: State['filters']) => any;
  prepareApiSort: (sort: State['sort']) => any;
  prepareRequestItemsResult: (result: any) => Pick<State, 'items' | 'total'>;
  prepareCreateItemResult: (result: any) => State['items'][0];
  prepareUpdateItemResult: (result: any) => State['items'][0];
  prepareRemoveItemResult: (result: any) => any;
  getSelectedItems: (state: State['itemsState']) => number[];
} & Ext['utils'];

type TLoadingKey = 'itemsIsLoading';

export type TListModelActions<
  Item extends TListModelItem,
  Ext extends TListModelExt,
  State extends TListModelState<Item, Ext> = TListModelState<Item, Ext>,
> = {
  // actions
  setSort: TActionCreator<State['sort']>;
  setPage: TActionCreator<State['page']>;
  setLimit: TActionCreator<State['limit']>;
  setTotal: TActionCreator<State['total']>;
  setFilters: TActionCreator<Partial<State['filters']>>;
  unshiftItem: TActionCreator<State['items'][0]>;
  refreshItem: TActionCreator<State['items'][0]>;
  setLoading: TActionCreator<boolean, TLoadingKey>;
  receiveItems: TActionCreator<State['items'], { isReplaceLastSegment?: boolean } | void>;
  setItemState: TActionCreator<TItemState, string | number>;
  resetItemState: TActionCreator<null, string | number>;
  setItemsState: TActionCreator<TItemState, Array<string | number>>;
  resetItemsState: TActionCreator<null, Array<string | number>>;
  setState: TActionCreator<Partial<State>>;
  toggleSelectedItem: TActionCreator<number>;
  resetSelectedItems: TActionCreator;
  resetItems: TActionCreator;
  reset: TActionCreator<void | { save: Array<keyof State> }>;

  // thunks
  updateSort: TThunkCreator<State['sort']>;
  resetSort: TThunkCreator;
  updatePage: TThunkCreator<State['page']>;
  updateFilters: TThunkCreator<
    Partial<State['filters']>,
    void | { isDebouncedRequestItems?: boolean; isNotRequestItems?: boolean },
    Promise<{ result?: Pick<State, 'items' | 'total'>; error?: Error }>
  >;
  requestItems: TThunkCreator<
    void | null,
    { isRequestLastSegment?: boolean } | void,
    Promise<{ result?: Pick<State, 'items' | 'total'>; error?: Error }>
  >;
  removeItemFromState: TThunkCreator<TItemId>;
  updateItemInState: TThunkCreator<Partial<State['items'][0]>, TItemId>;
  loadMore: TThunkCreator;
  createItem: TThunkCreator<
    any,
    void | {
    isUnshiftItem?: boolean;
    isRefreshItems?: boolean;
    onSuccess?: (result: State['items'][0]) => void;
  },
    Promise<{ result: State['items'][0]; error?: Error }>
  >;
  updateItem: TThunkCreator<
    any,
    {
      id: TItemId;
      isUpdateItemInState?: boolean;
      isRefreshItems?: boolean;
      onSuccess?: (result: State['items'][0]) => void;
    },
    Promise<{ result?: State['items'][0]; error?: Error }>
  >;
  removeItem: TThunkCreator<
    any,
    {
      id: TItemId;
      isRemoveItemFromState?: boolean;
      isRefreshItems?: boolean;
      onSuccess?: (result?: any) => void;
    },
    Promise<{ result?: any; error?: Error }>
  >;
} & Ext['actions'];

export type TListModelApi = Record<
  'requestItems' | 'createItem' | 'updateItem' | 'removeItem',
  (...args: any[]) => TResponse
>;

type TListModelStatic<Static extends TAnyObject = TEmptyObject> = Static & {
  requestItemsInstanceId: string | null;
};

type TListModelOptions<
  Id extends string,
  Static extends TAnyObject,
  Item extends TListModelItem,
  Ext extends TListModelExt,
> = {
  id: Id;
  staticData?: Static;
  utils?:
    | ((ctx: { id: Id; staticData: TListModelStatic<Static> }) => Partial<TListModelUtils<Item, Ext>>)
    | Partial<TListModelUtils<Item, Ext>>;
  api?: Partial<TListModelApi>;
  reducers?:
    | ((ctx: {
    id: Id;
    defaultState: TListModelState<Item, Ext>;
    staticData: TListModelStatic<Static>;
  }) => Partial<TModelReducers<TListModelState<Item, Ext>, TListModelActions<Item, Ext>>>)
    | Partial<TModelReducers<TListModelState<Item, Ext>, TListModelActions<Item, Ext>>>;
  thunks?:
    | ((ctx: {
    id: Id;
    defaultState: TListModelState<Item, Ext>;
    staticData: TListModelStatic<Static>;
    actions: TListModelActions<Item, Ext>;
    utils: TListModelUtils<Item, Ext>;
    api: TListModelApi;
  }) => Partial<TModelThunks<TListModelState<Item, Ext>, TListModelActions<Item, Ext>>>)
    | Partial<TModelThunks<TListModelState<Item, Ext>, TListModelActions<Item, Ext>>>;
  defaultState?: Partial<Ext['state']>;
};

const ListModel = <
  Id extends string,
  Static extends TAnyObject = TEmptyObject,
  Item extends TListModelItem = TListModelItem,
  Ext extends TListModelExt = TListModelExt,
>(
  options: TListModelOptions<Id, Static, Item, Ext>,
) => {
  const { id } = options;

  const staticData = { requestItemsInstanceId: null, ...options.staticData } as TListModelStatic<Static>;
  const api = { ...options.api } as TListModelApi;
  const debouncedRequestItems = createDebouncedCall();

  const utils: TListModelUtils<Item, Ext> = {
    prepareApiPaging: (page, limit) => ({
      limit,
      offset: limit * (page - 1),
    }),
    prepareApiFilters: (filters) => ({ ...filters }),
    prepareApiQueryFilters: () => ({}),
    prepareApiSort: () => ({}),
    prepareRequestItemsResult: (result) => result,
    prepareCreateItemResult: (result) => result,
    prepareUpdateItemResult: (result) => result,
    prepareRemoveItemResult: (result) => result,
    getSelectedItems: (itemsState) =>
      Object.entries(itemsState).reduce((result, [itemId, itemState]) => {
        if (itemState.selected) {
          result.push(Number(itemId));
        }
        return result;
      }, [] as number[]),
    ...(isFunction(options.utils) ? options.utils({ id, staticData }) : options.utils),
  };

  return Model<
    Id,
    TListModelStatic<Static>,
    TListModelState<Item, Ext>,
    TListModelUtils<Item, Ext>,
    TListModelActions<Item, Ext>
  >({
    id,
    staticData,
    defaultState: {
      sort: { direction: 'desc', property: 'created_at' },
      page: 1,
      limit: 20,
      items: [],
      total: 0,
      filters: {},
      itemsState: {},
      itemsIsLoading: false,
      ...options.defaultState,
    } as TListModelState<Item, Ext>,
    utils,
    reducers: (ctx) => {
      const { defaultState } = ctx;
      return {
        setSort: (state, { payload }) => ({ ...state, sort: payload }),
        setPage: (state, { payload }) => ({ ...state, page: payload }),
        setLimit: (state, { payload }) => {
          let nextItems = state.items;

            nextItems = nextItems.splice(0, payload);

          return { ...state, items: nextItems, limit: payload };
        },
        setTotal: (state, { payload }) => ({ ...state, total: payload }),
        setFilters: (state, { payload }) => ({ ...state, filters: { ...state.filters, ...payload } }),
        unshiftItem: (state, { payload }) => {
          let nextItems = [payload, ...state.items];

          nextItems = nextItems.splice(0, state.limit);

          return { ...state, items: nextItems };
        },
        refreshItem: (state, { payload }) => ({
          ...state,
          items: state.items.map((item) => {
            if (item.id === payload.id) {
              return payload;
            }
            return item;
          }),
        }),
        setLoading: (state, { payload, meta }) => ({ ...state, [meta]: payload }),
        receiveItems: (state, { payload, meta }) => ({ ...state, items: payload }),
        setItemState: (state, { payload, meta }) => ({
          ...state,
          itemsState: { ...state.itemsState, [meta]: { ...state.itemsState[meta], ...payload } },
        }),
        resetItemState: (state, { meta }) => {
          const nextItemsState = { ...state.itemsState };
          delete nextItemsState[meta];
          return {
            ...state,
            itemsState: nextItemsState,
          };
        },
        setItemsState: (state, { payload, meta }) => ({
          ...state,
          itemsState: {
            ...state.itemsState,
            ...meta.reduce(
              (result, itemId) => ({ ...result, [itemId]: { ...state.itemsState[itemId], ...payload } }),
              {},
            ),
          },
        }),
        resetItemsState: (state, { meta }) => {
          const nextItemsState = { ...state.itemsState };
          meta.forEach((itemId) => {
            delete nextItemsState[itemId];
          });
          return { ...state, itemsState: nextItemsState };
        },
        toggleSelectedItem: (state, { payload }) => ({
          ...state,
          itemsState: {
            ...state.itemsState,
            [payload]: {
              ...state.itemsState[payload],
              selected: !state.itemsState[payload]?.selected,
            },
          },
        }),
        resetSelectedItems: (state) => ({
          ...state,
          itemsState: Object.entries(state.itemsState).reduce((result, [itemId, itemState]) => {
            const nextItemState = { ...itemState };
            delete nextItemState.selected;
            return { ...result, [itemId]: nextItemState };
          }, {}),
        }),
        setState: (state, { payload }) => ({ ...state, ...payload }),
        resetItems: (state) => ({
          ...state,
          ...pick(defaultState, ['items', 'page', 'total']),
        }),
        reset: (state, { payload }) => ({ ...defaultState, ...(payload && pick(state, payload.save)) }),
        ...(isFunction(options.reducers) ? options.reducers(ctx) : options.reducers),
      } as TModelReducers<TListModelState<Item, Ext>, TListModelActions<Item, Ext>>;
    },
    thunks: (ctx) => {
      const { defaultState, actions } = ctx;
      return {
        updateSort: ({ dispatch }, { payload }) => {
          // todo handle lazy
          dispatch(actions.setSort(payload));
          // @ts-ignore
          dispatch(actions.setPage(defaultState.page));
          dispatch(actions.requestItems());
        },
        resetSort: ({ dispatch }) => {
          // todo handle lazy
          // @ts-ignore
          dispatch(actions.setSort(defaultState.sort));
          // @ts-ignore
          dispatch(actions.setPage(defaultState.page));
          dispatch(actions.requestItems());
        },
        updatePage: ({ dispatch, getState }, { payload }) => {
          if (getState().page === payload) {
            return;
          }

          // todo handle lazy
          dispatch(actions.setPage(payload));
          dispatch(actions.requestItems());
        },
        updateFilters: ({ dispatch }, { payload, meta }) => {
          // todo handle lazy
          dispatch(actions.setFilters(payload));
          // @ts-ignore
          dispatch(actions.setPage(defaultState.page));

          if (meta?.isNotRequestItems) {
            return {};
          }

          if (meta?.isDebouncedRequestItems) {
            return debouncedRequestItems(() => dispatch(actions.requestItems()));
          }

          return dispatch(actions.requestItems());
        },
        requestItems: async ({ dispatch, getState }, { meta }) => {
          dispatch(actions.setLoading(true, 'itemsIsLoading'));

          const { sort, page, limit, filters } = getState();

          const currentRequestItemsInstance = uniqueId(`${id}/requestItemsInstance`);
          staticData.requestItemsInstanceId = currentRequestItemsInstance;

          const { result, error } = await api.requestItems(
            pickBy(
              {
                // @ts-ignore
                ...utils.prepareApiPaging(page, limit, filters),
                // @ts-ignore
                ...utils.prepareApiFilters(filters),
                // @ts-ignore
                ...utils.prepareApiQueryFilters(filters),
                // @ts-ignore
                ...utils.prepareApiSort(sort),
              },
              identity,
            ),
          );

          if (currentRequestItemsInstance !== staticData.requestItemsInstanceId) {
            return { error: instanceIdDoesNotMatchError };
          }

          dispatch(actions.setLoading(false, 'itemsIsLoading'));

          if (!result) {
            return { error };
          }

          const preparedResult = utils.prepareRequestItemsResult(result);

          if (preparedResult.items.length === 0 && page > 1) {
            // @ts-ignore
            dispatch(actions.setPage(page - 1));
            return await dispatch(actions.requestItems(null, meta));
          }

          dispatch(actions.setTotal(preparedResult.total));
          dispatch(actions.receiveItems(preparedResult.items, { isReplaceLastSegment: meta?.isRequestLastSegment }));

          return { result: preparedResult };
        },
        loadMore: ({ dispatch, getState }) => {
          const { page } = getState();
          // @ts-ignore
          dispatch(actions.setPage(page + 1));
          dispatch(actions.requestItems());
        },
        createItem: async ({ dispatch }, { payload, meta }) => {
          dispatch(actions.setItemState({ creating: true }, 'new'));

          const { result, error } = await api.createItem(payload);

          dispatch(actions.setItemState({ creating: false }, 'new'));

          if (!result) {
            return { error };
          }

          const preparedResult = utils.prepareCreateItemResult(result);

          if (meta?.isUnshiftItem) {
            dispatch(actions.unshiftItem(preparedResult));
          }

          if (meta?.isRefreshItems) {
            dispatch(actions.requestItems());
          }

          if (meta?.onSuccess) {
            meta.onSuccess(preparedResult);
          }

          return { result: preparedResult };
        },
        updateItem: async ({ dispatch }, { payload, meta }) => {
          dispatch(actions.setItemState({ updating: true }, meta.id));

          const { result, error } = await api.updateItem(payload);

          dispatch(actions.setItemState({ updating: false }, meta.id));

          if (!result) {
            return { error };
          }

          const preparedResult = utils.prepareUpdateItemResult(result);

          if (meta?.isUpdateItemInState) {
            dispatch(actions.updateItemInState(preparedResult, meta.id));
          }

          if (meta?.isRefreshItems) {
            dispatch(actions.requestItems());
          }

          if (meta?.onSuccess) {
            meta.onSuccess(preparedResult);
          }

          return { result: preparedResult };
        },
        removeItem: async ({ dispatch }, { payload, meta }) => {
          dispatch(actions.setItemState({ removing: true }, meta.id));

          const { result, error } = await api.removeItem(payload);

          dispatch(actions.setItemState({ removing: false }, meta.id));

          if (!result) {
            return { error };
          }

          const preparedResult = utils.prepareRemoveItemResult(result);

          if (meta?.isRemoveItemFromState) {
            dispatch(actions.removeItemFromState(meta.id));
          }

          if (meta?.isRefreshItems) {
            dispatch(actions.requestItems());
          }

          if (meta?.onSuccess) {
            meta.onSuccess(preparedResult);
          }

          return { result: preparedResult };
        },
        removeItemFromState: ({ dispatch, getState }, { payload }) => {
          const state = getState();
          const nextItems = state.items.filter((item) => item.id !== payload);
          const isDiffItems = state.items.length > nextItems.length;
          if (isDiffItems) {
            const nextTotal = state.total - 1;
            const nextState = {
              ...state,
              items: nextItems,
              total: nextTotal,
            };
            dispatch(actions.setState(nextState));
          }
        },
        updateItemInState: ({ dispatch, getState }, { payload, meta }) => {
          const state = getState();

          dispatch(
            actions.setState({
              ...state,
              items: state.items.map((item) => {
                if (item.id === meta) return { ...item, ...payload };
                return item;
              }),
            }),
          );
          dispatch(actions.requestItems(null, { isRequestLastSegment: true }));
        },
        ...(isFunction(options.thunks) ? options.thunks({ ...ctx, utils, api }) : options.thunks),
      } as TModelThunks<TListModelState<Item, Ext>, TListModelActions<Item, Ext>>;
    },
  });
};

export default ListModel;
