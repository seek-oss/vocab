import { TranslationFile } from "@vocab/cli";

declare const translations: TranslationFile<{
  hello: { message: string };
  world: { message: string };
}>;

export default translations;
