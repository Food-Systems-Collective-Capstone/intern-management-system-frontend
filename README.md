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

*Ensure you have NodeJS/26 and pnpm/11.22.0 (or version listed in package.json)*

*Also create a /.env file in the root directory and fill in necessary variables, found in /.env.example*

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

## CI/CD Process

The current CI/CD pipeline is as follows:
```
    Developer runs tests locally
                |
                V
            Tests pass
                |
                V
Developer pushes to feature branch -----------> Commits to any non-main branch
                |                               trigger deployment to Vercel's
                |                               preview environment via its GitHub integration, 
                |                               generating a unique URL for each commit                              
                |
                V                               
        Pull request to Main
                |
                V
    GitHub Workflows runs test suite
     and creates the build artifact 
        on worker instance
                |
                V
        Builds and tests pass
                |
                V
        Merge changes to main ---------------> Changes to the main branch trigger
                                               a deployment to Vercel's production
                                               environment via its GitHub integration, 
                                               updating the live website
```