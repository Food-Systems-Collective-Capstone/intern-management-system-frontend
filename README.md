## SPECIFICATIONS

| Technology | Usage | Version |
| -------- | -------- | -------------- |
| NodeJS  | Runtime environment | 26 |
| pnpm  | JS/NodeJS Package manager | 11.22.0 |
| React | UI Library  | 19 |
| React-Router | Frontend framework  | 8 |
| Vite | Build tools, part of React-Router  | 8 |
| TailwindCSS  | CSS Library | 4 |


## ENVIRONMENT VARIABLES

| VARIABLE | SECRET | VALUE | Description |
| -------- | -------- | -------------- | ----------- |
| VITE_API_URL  | No | Deployed URL *("http://localhost:3000" if running locally)* | URL used to access backend NestJS API |

## FRONTEND SETUP 

***Ensure you have NodeJS/26 and pnpm/11.22.0 (or version listed in package.json)***

### Install Node dependencies 
``` 
pnpm install
```

### Running development server
Will start the development server at ***http://localhost:5173***
```
pnpm run dev
```

### Build the app
Will produce a ***/build/*** directory containing the packaged application
```
pnpm run build
```

## OTHER USEFUL COMMANDS
```
# will run react-router typegen and the TypeScript Compiler
pnpm run typecheck

# ESLint shortcuts
pnpm run lint       # Runs ESLint
pnpm run lint:fix   # Runs ESLint with --fix parameter

# Running Tests
pnpm run test       # Runs Vitest
```