## 添加本地子包

```
pnpm add @hfdraw/types --save
```

## 设置环境变量
```
    "start": "nest start -- --development",
```

```js
const isDevMode = process.argv.includes('--development');
console.log('isDevMode:', isDevMode);
console.log('process.argv:', process.argv);
```

isDevMode: true
process.argv: [
  'C:\\Users\\admin\\AppData\\Local\\Volta\\tools\\image\\node\\20.18.0\\node.exe',
  'D:\\sourcecode\\draw\\hfdraw\\services\\dist\\src\\main',
  '--development'
]