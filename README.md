# PO Search App

This is an application to search a directory for PDF and PNG files of a Purchase Order directory. It utilizes NodeJS, ExpressJS, EJS, some NPM modules.

## Installation

Install NodeJS for your appropriate operating system.
Click [HERE](https://nodejs.org/en/download/) for the latest downloads.

You can also click [HERE](https://nodejs.org/dist/latest-v10.x/) to use the version that I used when creating this app.

Once you have a command prompt open, use the following commands:
```bash
git clone git@github.com:jcosentino/po_search_app.git
cd po_search_app
npm install
node app.js
```


## Background
This was created for a specific set of files that contained a sporadic document structure. There are a lot of seemingly strange splits and parses in the code. This is due to the fact that the files that I was working with had little consistencies in their structure. There were documents from an old server and new server, yet I needed to grab the same pieces of data in a uniform fashion.

## Wishful Thinking
I would go back and change the CSS formatting for the table title, and I would clean up a lot of syntax. I could have utilized .map and .filter instead of the loops that I used.
