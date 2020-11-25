import { promises as fs } from 'fs';

import {
  getAllTranslationFiles,
  getAltLanguageFilePath,
  getAltLanguages,
  getDevLanguage,
} from '@vocab/core';
import FormData from 'form-data';

import { callPhrase, getUniqueNameForFile } from './phrase-api';
import { logError, trace } from './logger';

interface TranslationFile {
  [k: string]: { message: string; description?: string };
}
type AlternativeLanguage = string;

async function optionalReadFile(relativePath: string, optional?: boolean) {
  const fileContent = await fs.readFile(relativePath, 'utf8').catch((error) => {
    if (optional) {
      trace('No file for optional:', relativePath);
    } else {
      logError('Error reading file:', relativePath, '. Error: ', error);
    }
  });
  if (!fileContent) {
    if (optional) {
      trace('Ignoring missing optional file');
      return;
    }
    throw new Error(`Error reading ${relativePath}`);
  }
  return fileContent;
}

async function uploadFile(
  contents: TranslationFile,
  locale_id: string,
  branch: string,
) {
  const formData = new FormData();
  formData.append('file', Buffer.from(JSON.stringify(contents)), {
    contentType: 'application/json',
    filename: `${locale_id}.json`,
  });

  formData.append('file_format', 'json');
  formData.append('locale_id', locale_id);
  formData.append('branch', branch);
  formData.append('update_translations', 'true');

  trace('Starting to upload:', locale_id);

  await callPhrase(`uploads`, {
    method: 'POST',
    body: formData,
  });
  trace('Successfully Uploaded:', locale_id, '\n');
}

interface PushOptions {
  branch: string;
}
export async function push({ branch }: PushOptions) {
  const alternativeLanguages = getAltLanguages();
  const defaultlanguage = getDevLanguage();
  await callPhrase(`branches`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name: branch }),
  });
  trace('Created branch:', branch);

  const defaultLanguageTranslationFile: TranslationFile = {};
  const alternativeLanguageTranslations: Record<
    AlternativeLanguage,
    TranslationFile
  > = {};
  const uniqueNames = new Set();

  const files = await getAllTranslationFiles();
  for (const relativePath of files) {
    const uniqueName = getUniqueNameForFile(relativePath);
    if (uniqueNames.has(uniqueName)) {
      throw new Error(
        'Duplicate unique names found. Improve name hasing algorthym',
      );
    }
    uniqueNames.add(uniqueName);
    const fileContents = await optionalReadFile(relativePath, false);
    if (!fileContents) {
      throw new Error(`Error reading file ${relativePath}`);
    }
    const defaultValues: TranslationFile = JSON.parse(fileContents);

    const localKeys = Object.keys(defaultValues);

    for (const key of localKeys) {
      if (defaultLanguageTranslationFile[`${uniqueName}-${key}`]) {
        throw new Error(`Duplicate key found`);
      }
      defaultLanguageTranslationFile[`${uniqueName}-${key}`] =
        defaultValues[key];
    }
    for (const alternativeLanguage of alternativeLanguages) {
      const alternativeFileContents = await optionalReadFile(
        getAltLanguageFilePath(relativePath, alternativeLanguage),
        true,
      );
      if (!alternativeFileContents) {
        continue;
      }
      if (!alternativeLanguageTranslations[alternativeLanguage]) {
        alternativeLanguageTranslations[alternativeLanguage] = {};
      }

      const extraValues: TranslationFile = JSON.parse(alternativeFileContents);

      for (const key of localKeys) {
        if (
          alternativeLanguageTranslations[alternativeLanguage][
            `${uniqueName}-${key}`
          ]
        ) {
          throw new Error(`Duplicate key found`);
        }
        if (!extraValues[key]) {
          logError(
            `Missing message for key ${key} in language ${alternativeLanguage}. Recieved:`,
            extraValues[key],
          );
          continue;
        }
        alternativeLanguageTranslations[alternativeLanguage][
          `${uniqueName}-${key}`
        ] = {
          message: extraValues[key].message,
          description: defaultValues[key].description,
        };
      }
    }
  }

  await uploadFile(defaultLanguageTranslationFile, defaultlanguage, branch);
  for (const alternativeLanguage of alternativeLanguages) {
    if (alternativeLanguageTranslations[alternativeLanguage]) {
      await uploadFile(
        alternativeLanguageTranslations[alternativeLanguage],
        alternativeLanguage,
        branch,
      );
    }
  }
}
