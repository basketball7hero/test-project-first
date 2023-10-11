import React from 'react';
import {FormProvider, useForm} from "react-hook-form";
import postsModel from "../../store/models/postsModel";
import {useDispatch} from "../../hooks";
import validator from "../../utils/validator";

type TFormValues = {
  title: string;
  body: string;
};

const validate = validator((schema) => schema.object({
  title: schema.string().required().min(10).max(50),
  body: schema.string().required().min(50).max(100),
}));

const defaultValues: TFormValues = {
  title: '',
  body: '',
};

const CreatePostForm = React.memo(() => {
  const dispatch = useDispatch();

  const form = useForm<TFormValues>({
    defaultValues,
    resolver: validate,
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    const {result} = await dispatch(postsModel.actions.createItem({
      title: values.title.trim(),
      body: values.body.trim(),
    }, {isUnshiftItem: true, isRefreshItems: false}));
    if (result) {
      form.reset({...defaultValues});
    }
  });

  const titleError = form.formState.errors.title?.message || '';
  const bodyError = form.formState.errors.body?.message || '';

  return (
    <FormProvider {...form}>
      <form className="flex column gap-2" onSubmit={handleSubmit} data-name="create-post-form">
        <h4>Post creation form</h4>
        <div className="flex column">
          <input value={form.watch('title')} placeholder="title" type="text" {...form.register('title', {onBlur: () => form.setValue('title', form.getValues().title.trim())})} />
          <div className={titleError ? 'error-text' : undefined}>{titleError}</div>
        </div>
        <div className="flex column">
          <textarea value={form.watch('body')} className="noresize" placeholder="body" {...form.register('body', {onBlur: () => form.setValue('body',form.getValues().body.trim())})} />
          <div className={bodyError ? 'error-text' : undefined}>{bodyError}</div>
        </div>
        <button type="submit">Create Post</button>
      </form>
    </FormProvider>
  )
});

export default CreatePostForm;
