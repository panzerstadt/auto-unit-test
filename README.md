# Auto Unit Tester

### automatically generate unit tests for your code on save

make sure you have an `.env` file, and add your OpenAI API KEY to it: `OPENAI_API_KEY=<YOUR API KEY>`

```
npm install
cd auto-unit-test
npm link
cd <to your directory>
npm link auto-unit-test
auto-unit-test
```

### changing file

auto-unit-test's .mts is compiled into .mjs, please run `npm run build`
