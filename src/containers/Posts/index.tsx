import React from 'react';
import { AgGridReact } from "ag-grid-react";
import {RowSelectedEvent} from "ag-grid-community";

import {useDispatch, useSelector} from '../../hooks';
import {TPost} from '../../api/posts';
import postsModel from '../../store/models/postsModel';
import CreatePostForm from '../CreatePostForm';

const Posts = React.memo(() => {
  const dispatch = useDispatch();
  const items = useSelector(postsModel.selectors.items);
  const itemsState = useSelector(postsModel.selectors.itemsState);
  const selectedItems = React.useMemo(() => Object.entries(itemsState).reduce((result, [id, current]) => {
    if (current.selected) {
      result.push(Number(id));
    }
    return result;
  }, [] as number[]), [itemsState]);

  React.useEffect(() => {
    dispatch(postsModel.actions.requestItems());

    return () => {
      dispatch(postsModel.actions.reset());
    };
  }, [dispatch]);

  const handleRowSelected = React.useCallback((event: RowSelectedEvent<TPost>) => {
    if (event) {
      dispatch(postsModel.actions.setItemState({selected: event.node.isSelected() as boolean}, event.data!.id))
    }
  }, [dispatch]);

  const handleDelete = () => {
    selectedItems.forEach((id) => {
      dispatch(postsModel.actions.setItemState({selected: false}, id));
      dispatch(postsModel.actions.removeItem(id, {isRemoveItemFromState: true, id, isRefreshItems: false})); // isRefreshItems: false чтобы список не перезагпужался
    });
  }

  return (
    <div className="flex-1 column ag-theme-alpine gap-2 px-8" style={{ height: '100%', width: '100%' }}>
      <div className="flex gap-2 align-center">
        <h1>Posts</h1>
        <button className="ml-auto" onClick={handleDelete} data-name="remove-selected-posts" disabled={!selectedItems.length}>remove selected{selectedItems.length > 0 ? ` (${selectedItems.length})` : ''}</button>
      </div>
      <CreatePostForm />
      <br/>
      <AgGridReact
        rowSelection="multiple"
        onRowSelected={handleRowSelected}

        // не получилось вынести в константу, какая-то проблема с типами, но этот объект нада бы мемонизировать
        columnDefs={[
          { field: 'id' },
          { field: 'title' },
          { field: 'body' },
          { field: 'userId' },
        ]}

        rowData={items}  />
    </div>
  )
});


export default Posts;
