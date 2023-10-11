import ListModel from "../ListModel";
import {TEmptyObject} from '../../types';
import posts, {TPost} from '../../api/posts';

const id = 'posts';

const postsModel = ListModel<typeof id, TEmptyObject, TPost>({
  id,
  api: {
    requestItems: posts.list,
    createItem: posts.create,
    removeItem: posts.remove,
    // updateItem: posts.update,
  },
});

export default postsModel;
