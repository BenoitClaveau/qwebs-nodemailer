# qwebs-nodemailer
> Send e-mail with [nodemailer](https://www.npmjs.com/package/nodemailer) for your [Qwebs server](https://www.npmjs.com/package/qwebs).

## Features

  * [Qwebs](https://www.npmjs.com/package/qwebs)
  * [Nodemailer](https://www.npmjs.com/package/nodemailer)
  * [Promise](https://www.npmjs.com/package/q)
  
### Add the nodemailer parameters in config.json

```json
{
  "nodemailer": {
    "transport": {
      "service": "service name",
      "auth": {
            "user": "user",
            "pass": "password"
        }
    }
		"dkim": {
			"domainName": "your domain.com",
			"keySelector": "123456",
      "privateKey": "./key.pem"
		},
		"from": "your e-mail address"
}
```

### Declare and inject $mailer

```js
var Qwebs = require("qwebs");
var qwebs = new Qwebs();

qwebs.inject("$mailer", "qwebs-nodemailer");
```

## API

  * send(mailerOptions)
  
```js
var mailOptions = {
    from: 'Fred Foo ✔ <foo@blurdybloop.com>', // sender address 
    to: 'bar@blurdybloop.com, baz@blurdybloop.com', // list of receivers 
    subject: 'Hello ✔', // Subject line 
    text: 'Hello world ✔', // plaintext body 
    html: '<b>Hello world ✔</b>' // html body 
};

return $mailer.send(mailOptions);
```

## Installation

```bash
$ npm install qwebs-nodemailer
```