import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';

export const yup = Yup;

type TCreator = (schema: typeof yup) => Yup.AnyObjectSchema;

const validator = <C extends TCreator>(creator: C) => yupResolver(creator(yup));

export default validator;
