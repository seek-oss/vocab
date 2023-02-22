/* eslint-disable no-console */
import path from 'path';

import webpack from 'webpack';
import WDS from 'webpack-dev-server';
import waitOn from 'wait-on';

import { spawn } from 'child_process';

interface Options {
  disableVocabPlugin?: boolean;
}

export interface TestServer {
  url: string;
  close: () => void;
}

let portCounter = 10001;

export const runServerFixture = (fixtureName: string): Promise<TestServer> =>
  new Promise((resolve) => {
    const port = portCounter++;
    const getConfig = require(`${fixtureName}/webpack.config.js`);
    const config = getConfig();
    const compiler = webpack(config);

    compiler.hooks.done.tap('vocab-test-helper', async () => {
      const cwd = path.dirname(
        require.resolve(`${fixtureName}/vocab.config.js`),
      );
      const childProcess = spawn('node', ['./dist-server/server.js'], {
        env: { ...process.env, SERVER_PORT: port.toString() },
        stdio: 'inherit',
        cwd,
      });
      await waitOn({ resources: [`http://localhost:${port}`] });

      resolve({
        url: `http://localhost:${port}`,
        close: () => {
          childProcess.kill();
        },
      });
    });
    compiler.run(() => {
      // Run webpack build
    });
  });

export const startFixture = (
  fixtureName: string,
  options: Options = {},
): Promise<TestServer> =>
  new Promise(async (resolve) => {
    const getConfig = require(`${fixtureName}/webpack.config.js`);
    const config = getConfig(options);
    const compiler = webpack(config);

    const port = portCounter++;
    const server = new WDS({ port }, compiler);

    compiler.hooks.done.tap('vocab-test-helper', () => {
      resolve({
        url: `http://localhost:${port}`,
        close: () => server.stopCallback(),
      });
    });

    server.startCallback(() => {
      console.log(`Running fixture ${fixtureName}`);
    });
  });

export const getAppSnapshot = async (
  url: string,
  warningFilter = () => true,
) => {
  const warnings: unknown[] = [];
  const errors: unknown[] = [];

  const page = await browser.newPage();

  page.on('console', (msg) => {
    if (msg.type() === 'warning') {
      warnings.filter(warningFilter).push(msg.text());
    }

    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });

  const response = await page.goto(url, { waitUntil: 'networkidle0' });
  const sourceHtml = await response?.text();
  const clientRenderContent = await page.content();

  expect(warnings).toEqual([]);
  expect(errors).toEqual([]);

  return { sourceHtml, clientRenderContent };
};

export const getLanguageChunk = async ({
  serverUrl,
  language,
}: {
  serverUrl: string;
  language: string;
}) => {
  const response = await page.goto(`${serverUrl}/${language}-translations.js`);
  const source = await response?.text();

  return source;
};
