# Medport

To run the code, you will need to run the following commands in a terminal/command prompt.

### Back-end:

```shell
$ cd ./backend

# Installs the dependencies
$ npm install 

# This will build the dist folder, and run the Primsa generate command
$ npm run build 

# Starts the server
$ npm run start 
```

### Front-end:

```shell
$ cd ./frontend

# Installs the dependencies
$ npm install 

# This will build (Optional)
$ npm run build 

# Starts the local dev server
$ npm run dev
```

## Github Actions

When you push to the `develop` branch, it will fire off a couple of Github Actions. One is to build and deploy the back-end. The other is to build and deploy the front-end.

You can click on the `Actions` tab to view the progress of the deployment.

## .env & node_modules

As you will notice, I did remove the .env files, and left an example - to keep sensitive data out of the public internet.

I also removed the `node_modules` folders as well, as these are generated when you run `npm install`, and just bog up source repositories.