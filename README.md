
# ***Reflect***

  

>*An Discord server cloner made with Node.JS and Discord.js V11*

  

# Requirements -

- Node.JS

- Discord User Account token 
>To obtain the token access the developer console on discord and to the console tab and insert the following lines of code -
```window.webpackChunkdiscord_app.push([
  [Math.random()],
  {},
  req => {
    for (const m of Object.keys(req.c)
      .map(x => req.c[x].exports)
      .filter(x => x)) {
      if (m.default && m.default.getToken !== undefined) {
        return copy(m.default.getToken());
      }
      if (m.getToken !== undefined) {
        return copy(m.getToken());
      }
    }
  },
]);
console.log('%cWorked!', 'font-size: 50px');
console.log(`%cYou now have your token in the clipboard!`, 'font-size: 16px');

  ```
  **Credit -** [Hxr404](https://github.com/hxr404/Discord-Console-hacks)
 
# Installation

  

1. Download the repository and extract it wherever you want

 2. Open the folder and install the dependencies by opening the folder in the terminal or cmd and running `npm i` 

2. After the dependencies have been downloaded type `node main.js` and hit enter.

3. Enter the necessary info for it to clone. (Your account's token, ID of The server to be cloned and the target servers' ID)

4. Run the code.


****
Also available on [Repl-it](https://replit.com/@Sakuu/Reflect%29%29)
I am on discord too - messiah#2087
