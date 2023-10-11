import {AxiosRequestConfig, AxiosInstance, AxiosError} from 'axios';

// это приблизительная реализация, по этому тут бы я не акцентировал внимание

export type TResponseBase<R = any> = {result?: R, error?: Error};
export type TResponse<R = any> = Promise<TResponseBase<R>>;
const xhr = async <R = any>(config: AxiosRequestConfig, transport: AxiosInstance): Promise<TResponseBase<R>> => {
  try {
    const response = await transport<R>(config);

    if (response.status >= 400) {
      throw new Error(response.statusText);
    }

    return {result: response.data};

  } catch (error: any | AxiosError) {
    return {error: new Error(error?.message ?? 'unknownError')};
  }
};

export default xhr;
