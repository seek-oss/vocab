import IntlMessageFormat from 'intl-messageformat';
import {
  type MessageFormatElement,
  type PluralOrSelectOption,
  TYPE,
} from '@formatjs/icu-messageformat-parser';
import { printAST } from '@formatjs/icu-messageformat-parser/printer.js';
import type { MessageGenerator, TranslationsByKey } from './types';

export function generateLanguageFromTranslations({
  baseTranslations,
  generator,
}: {
  baseTranslations: TranslationsByKey<string>;
  generator: MessageGenerator;
}): TranslationsByKey<string> {
  if (!generator.transformElement && !generator.transformMessage) {
    return baseTranslations;
  }

  const translationKeys = Object.keys(baseTranslations);
  const generatedTranslations: TranslationsByKey<string> = {};

  for (const translationKey of translationKeys) {
    const translation = baseTranslations[translationKey];
    let transformedMessage = translation.message;

    if (generator.transformElement) {
      const messageAst = new IntlMessageFormat(translation.message).getAst();
      const transformedAst = messageAst.map(
        transformMessageFormatElement(generator.transformElement),
      );
      transformedMessage = printAST(transformedAst);
    }

    if (generator.transformMessage) {
      transformedMessage = generator.transformMessage(transformedMessage);
    }

    generatedTranslations[translationKey] = {
      message: transformedMessage,
    };
  }

  return generatedTranslations;
}

function transformMessageFormatElement(
  transformElement: (message: string) => string,
): (messageFormatElement: MessageFormatElement) => MessageFormatElement {
  return (messageFormatElement: MessageFormatElement) => {
    const transformedMessageFormatElement = { ...messageFormatElement };

    switch (transformedMessageFormatElement.type) {
      case TYPE.literal:
        const transformedValue = transformElement(
          transformedMessageFormatElement.value,
        );
        transformedMessageFormatElement.value = transformedValue;
        break;

      case TYPE.select:
      case TYPE.plural:
        const transformedOptions: Record<string, PluralOrSelectOption> = {
          ...transformedMessageFormatElement.options,
        };

        for (const key of Object.keys(transformedOptions)) {
          transformedOptions[key].value = transformedOptions[key].value.map(
            transformMessageFormatElement(transformElement),
          );
        }

        break;

      case TYPE.tag:
        const transformedChildren =
          transformedMessageFormatElement.children.map(
            transformMessageFormatElement(transformElement),
          );
        transformedMessageFormatElement.children = transformedChildren;
        break;

      default:
        break;
    }

    return transformedMessageFormatElement;
  };
}
