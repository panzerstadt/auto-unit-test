#! /usr/bin/env node

import * as dotenv from 'dotenv'; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config();
import { Configuration, OpenAIApi } from 'openai';
import chokidar from 'chokidar';
import { existsSync } from 'fs';
import fs from 'node:fs/promises';
import { exec } from 'node:child_process';
import jest from 'jest';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

async function generateTests(filePath: string, input: string) {
  const prompt = `// Javascript
  // write unit tests for the following function that will work for
  // the jest testing framework.
  // Assume that the function is exported as a default export, and name the function testFunction
  // Assume that the reply is a valid javascript file
  // the tests have to achieve 100% test coverage
  // the tests should additionally cover edge cases, and should be as comprehensive as possible

  ${input}
  
  // in your reply, start with the following:
  const testFunction = require("./${filePath}');
  `;

  const completions = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0,
  });
  const generatedTests = completions.data.choices[0].message.content || '';
  return generatedTests;
}

async function runTests(filePath) {
  const testFilePath = filePath.replace('.js', '.test.js');
  const options = {
    projects: [process.cwd()],
    silent: true,
    coverage: true,
    testRegex: testFilePath,
    passWithNoTests: true,
  };

  // @ts-ignore
  const { results } = await jest.runCLI(options, options.projects);
  // console.log("converage?", results.testResults); // TODO: jest doens't expose coverage data
  // console.log("results", results.testResults[0].testResults);
  console.log('[DEBUG] coverage data:', results.coverageMap.data);
  if (results.testResults.length === 0) {
    console.warn('No tests were run.');
    return;
  }
  const resultJSON = results.testResults[0].testResults;
  console.log('\nresults:\n-----------');

  resultJSON.forEach((res) => {
    const passed = res.status === 'passed';

    console.log(`${passed ? '✓' : '✘'} ${res.status}: ${res.fullName}`);
  });

  const hasFailures = resultJSON.some((res) => res.status !== 'passed');
  if (hasFailures) {
    console.warn(
      '\nOne or more tests failed, please fix them before continuing.'
    );
  }
}

async function generateTestsOnSave(filePath) {
  const testFilePath = filePath.replace('.js', '.test.js');

  if (existsSync(testFilePath)) {
    console.log(
      `Tests exist for ${filePath}, skipping. If you want to regenerate tests, delete the current one and save the file again.`
    );
    return;
  }
  try {
    const input = await fs.readFile(filePath, 'utf8');
    const generatedTests = await generateTests(filePath, input);
    await fs.writeFile(testFilePath, generatedTests);
    console.log(`Generated tests for ${filePath}`);
  } catch (error) {
    console.error(`Error generating tests for ${filePath}`, error);
  }
}

async function generateDocs(input: string) {
  const prompt = `Generate professional documentation, and include example usage patterns for the following code: "${input}"`;
  const completions = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
  });
  const generatedTests = completions.data.choices[0].message.content || '';
  return generatedTests;
}

async function generateDocsOnSave(filePath) {
  const docFilePath = filePath.replace('.js', '.md');

  if (existsSync(docFilePath)) {
    console.log(
      `Documentation exists for ${filePath}, skipping. If you want to regenerate docs, delete the current one and save the file again.`
    );
    return;
  }

  try {
    const input = await fs.readFile(filePath, 'utf8');
    const generatedTests = await generateDocs(input);
    await fs.writeFile(docFilePath, generatedTests);
    console.log(`Generated documentation for ${filePath}`);
  } catch (error) {
    console.error(`Error generating docs for ${filePath}`, error);
  }
}

console.log(
  'auto-unit-test started. save any .js file and watch it generate tests and docs!'
);
// watch for changes to js files, skipping over test files
chokidar.watch('**/*.js', { atomic: true }).on('change', async (filePath) => {
  if (filePath.includes('node_modules')) return;
  if (filePath.includes('coverage')) return;
  if (filePath.includes('auto-unit-test')) return;

  // if the file being saved is a test file, run tests
  if (filePath.includes('.test.')) {
    const cleaned = filePath.replace('.test.', '.');
    console.log(`running tests for ${cleaned}`);
    await runTests(cleaned);
    return;
  }

  // generate docs, tests and run tests on code
  if (!filePath.includes('.test.')) {
    console.log(`trying to generate docs for: ${filePath}...`);
    generateDocsOnSave(filePath);

    console.log(`trying to generate tests for: ${filePath}...`);
    await generateTestsOnSave(filePath);

    console.log(`running tests for ${filePath}`);
    await runTests(filePath);
  }
});
