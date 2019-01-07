## Usage

```bash
git clone https://github.com/zbinlin/interesting-service-worker.git
cd interesting-service-worker/
npm install
# exports CHROME_BIN_PATH=`YOU_CHROME_BINARY_PATH`
# example:
# export CHROME_BIN_PATH=/usr/bin/chromium
node dl.js "https://www.baidu.com/"
# then close chromium/chrome
node index.js
# then open http://localhost:3000/
```
