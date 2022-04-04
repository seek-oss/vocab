import IntlMessageFormat from 'intl-messageformat';
import {
  createLiteralElement,
  MessageFormatElement,
  PluralOrSelectOption,
  TYPE,
} from '@formatjs/icu-messageformat-parser';
import { printAST } from '@formatjs/icu-messageformat-parser/printer';
import { MessageGenerator, TranslationsByKey } from '@vocab/types';

const startPaddingLiteralElement = createLiteralElement('[');
const endPaddingLiteralElement = createLiteralElement(']');

export function generateLanguageFromTranslations({
  baseTranslations,
  generator,
}: {
  baseTranslations: TranslationsByKey<string>;
  generator: MessageGenerator;
}) {
  const generatedTranslations: TranslationsByKey<string> = {};

  for (const translationKey of Object.keys(baseTranslations)) {
    const translation = baseTranslations[translationKey];
    const messageAst = new IntlMessageFormat(translation.message).getAst();
    const pseudoLocalizedAst = [
      startPaddingLiteralElement,
      ...messageAst.map(generateMessageFormatElement(generator)),
      endPaddingLiteralElement,
    ];
    generatedTranslations[translationKey] = {
      message: printAST(pseudoLocalizedAst),
    };
  }

  return generatedTranslations;
}

function generateMessageFormatElement(
  generator: (message: string) => string,
): (messageFormatElement: MessageFormatElement) => MessageFormatElement {
  return (messageFormatElement: MessageFormatElement) => {
    const pseudoLocalizedMessageFormatElement = { ...messageFormatElement };

    switch (pseudoLocalizedMessageFormatElement.type) {
      case TYPE.literal:
        const pseudoLocalizedValue = generator(
          pseudoLocalizedMessageFormatElement.value,
        );
        pseudoLocalizedMessageFormatElement.value = pseudoLocalizedValue;
        break;

      case TYPE.select:
      case TYPE.plural:
        const pseudoLocalizedOptions: Record<string, PluralOrSelectOption> = {
          ...pseudoLocalizedMessageFormatElement.options,
        };

        for (const key of Object.keys(pseudoLocalizedOptions)) {
          pseudoLocalizedOptions[key].value = pseudoLocalizedOptions[
            key
          ].value.map(generateMessageFormatElement(generator));
        }

        break;

      case TYPE.tag:
        const pseudoLocalizedChildren =
          pseudoLocalizedMessageFormatElement.children.map(
            generateMessageFormatElement(generator),
          );
        pseudoLocalizedMessageFormatElement.children = pseudoLocalizedChildren;
        break;

      default:
        break;
    }

    return pseudoLocalizedMessageFormatElement;
  };
}
