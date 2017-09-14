# annot8-express

This small package makes sure that every AWS X-ray trace that passes through an express app has additional annotations that make it easier to find the right traces later on.

It is usefule especially in cases where you are using aws-serverless-express package to put your express application inside an AWS Lambda.

## Installation

In order to install perform

`npm install annot8-express --save`

## Usage

Simply add the middleware after the open segment statement


    let annot8 = require("annot8-express");
    app.use(annot8);