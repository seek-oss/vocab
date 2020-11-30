import { TranslationFile } from '@vocab/core';

declare const translations: TranslationFile<{
  hello: { returnType: string; message: string };
  world: { returnType: string; message: string };
}>;

export default translations;
