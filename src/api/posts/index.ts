import axios from 'axios';

import xhr, {TResponse} from '../xhr';
import {TPost} from "./types";
export * from './types';

const transport = axios.create({
  baseURL: 'https://run.mocky.io/v3',
});

const posts = {
  list: (payload: null, params: Record<string, string>) => xhr<TPost[]>({url: '/dc304d0f-7214-4982-beb5-e13f12d18935', method: 'GET', params}, transport),
  create: (payload: Pick<TPost, 'body' | 'title'>) => Promise.resolve({result: {
    ...payload,
    userId: 1000,
    id: Date.now(),
  }}) as TResponse<TPost>,
  remove: () => Promise.resolve({result: true}) as TResponse<true>,
}

export default posts;
