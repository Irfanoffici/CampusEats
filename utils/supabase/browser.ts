01:31:30.358 Running build in Washington, D.C., USA (East) – iad1
01:31:30.359 Build machine configuration: 2 cores, 8 GB
01:31:30.478 Cloning github.com/Irfanoffici/CampusEats (Branch: main, Commit: 0c6eac6)
01:31:30.752 Cloning completed: 274.000ms
01:31:32.559 Restored build cache from previous deployment (HZXzXN5FfYyqadzDDawM1W2sfnm9)
01:31:33.359 Running "vercel build"
01:31:33.758 Vercel CLI 48.10.5
01:31:33.932 WARN! Due to `builds` existing in your configuration file, the Build and Development Settings defined in your Project Settings will not apply. Learn More: https://vercel.link/unused-build-settings
01:31:34.112 Installing dependencies...
01:31:37.637 
01:31:37.638 > campuseats@1.0.0 postinstall
01:31:37.638 > prisma generate
01:31:37.638 
01:31:38.120 Prisma schema loaded from prisma/schema.prisma
01:31:38.667 
01:31:38.668 ✔ Generated Prisma Client (v5.22.0) to ./node_modules/@prisma/client in 323ms
01:31:38.668 
01:31:38.668 Start by importing your Prisma Client (See: https://pris.ly/d/importing-client)
01:31:38.668 
01:31:38.668 Tip: Need your database queries to be 1000x faster? Accelerate offers you that and more: https://pris.ly/tip-2-accelerate
01:31:38.668 
01:31:38.856 
01:31:38.856 added 59 packages, removed 18 packages, and changed 26 packages in 4s
01:31:38.857 
01:31:38.857 166 packages are looking for funding
01:31:38.857   run `npm fund` for details
01:31:38.894 Detected Next.js version: 14.2.33
01:31:38.899 Running "npm run vercel-build"
01:31:39.011 
01:31:39.011 > campuseats@1.0.0 vercel-build
01:31:39.011 > prisma generate && next build
01:31:39.011 
01:31:39.353 Prisma schema loaded from prisma/schema.prisma
01:31:39.790 
01:31:39.791 ✔ Generated Prisma Client (v5.22.0) to ./node_modules/@prisma/client in 268ms
01:31:39.791 
01:31:39.791 Start by importing your Prisma Client (See: https://pris.ly/d/importing-client)
01:31:39.791 
01:31:39.791 Tip: Interested in query caching in just a few lines of code? Try Accelerate today! https://pris.ly/tip-3-accelerate
01:31:39.791 
01:31:39.852 ┌─────────────────────────────────────────────────────────┐
01:31:39.853 │  Update available 5.22.0 -> 7.0.0                       │
01:31:39.853 │                                                         │
01:31:39.853 │  This is a major update - please follow the guide at    │
01:31:39.853 │  https://pris.ly/d/major-version-upgrade                │
01:31:39.854 │                                                         │
01:31:39.854 │  Run the following to update                            │
01:31:39.854 │    npm i --save-dev prisma@latest                       │
01:31:39.854 │    npm i @prisma/client@latest                          │
01:31:39.854 └─────────────────────────────────────────────────────────┘
01:31:40.670   ▲ Next.js 14.2.33
01:31:40.671 
01:31:40.739    Creating an optimized production build ...
01:32:02.282  ✓ Compiled successfully
01:32:02.283    Linting and checking validity of types ...
01:32:12.814 Failed to compile.
01:32:12.814 
01:32:12.815 ./app/api/signup/route.ts:84:40
01:32:12.815 Type error: Expected 4-5 arguments, but got 3.
01:32:12.815 
01:32:12.815 [0m [90m 82 |[39m[0m
01:32:12.815 [0m [90m 83 |[39m     [90m// Create user in database[39m[0m
01:32:12.815 [0m[31m[1m>[22m[39m[90m 84 |[39m     [36mconst[39m user [33m=[39m [36mawait[39m [33mDatabaseService[39m[33m.[39msyncWrite([0m
01:32:12.815 [0m [90m    |[39m                                        [31m[1m^[22m[39m[0m
01:32:12.815 [0m [90m 85 |[39m       [32m'create'[39m[33m,[39m[0m
01:32:12.815 [0m [90m 86 |[39m       [90m// Firebase write (PRIMARY)[39m[0m
01:32:12.815 [0m [90m 87 |[39m       [36masync[39m () [33m=>[39m {[0m
01:32:12.839 Next.js build worker exited with code: 1 and signal: null
01:32:12.858 Error: Command "npm run vercel-build" exited with 101:31:30.358 Running build in Washington, D.C., USA (East) – iad1
01:31:30.359 Build machine configuration: 2 cores, 8 GB
01:31:30.478 Cloning github.com/Irfanoffici/CampusEats (Branch: main, Commit: 0c6eac6)
01:31:30.752 Cloning completed: 274.000ms
01:31:32.559 Restored build cache from previous deployment (HZXzXN5FfYyqadzDDawM1W2sfnm9)
01:31:33.359 Running "vercel build"
01:31:33.758 Vercel CLI 48.10.5
01:31:33.932 WARN! Due to `builds` existing in your configuration file, the Build and Development Settings defined in your Project Settings will not apply. Learn More: https://vercel.link/unused-build-settings
01:31:34.112 Installing dependencies...
01:31:37.637 
01:31:37.638 > campuseats@1.0.0 postinstall
01:31:37.638 > prisma generate
01:31:37.638 
01:31:38.120 Prisma schema loaded from prisma/schema.prisma
01:31:38.667 
01:31:38.668 ✔ Generated Prisma Client (v5.22.0) to ./node_modules/@prisma/client in 323ms
01:31:38.668 
01:31:38.668 Start by importing your Prisma Client (See: https://pris.ly/d/importing-client)
01:31:38.668 
01:31:38.668 Tip: Need your database queries to be 1000x faster? Accelerate offers you that and more: https://pris.ly/tip-2-accelerate
01:31:38.668 
01:31:38.856 
01:31:38.856 added 59 packages, removed 18 packages, and changed 26 packages in 4s
01:31:38.857 
01:31:38.857 166 packages are looking for funding
01:31:38.857   run `npm fund` for details
01:31:38.894 Detected Next.js version: 14.2.33
01:31:38.899 Running "npm run vercel-build"
01:31:39.011 
01:31:39.011 > campuseats@1.0.0 vercel-build
01:31:39.011 > prisma generate && next build
01:31:39.011 
01:31:39.353 Prisma schema loaded from prisma/schema.prisma
01:31:39.790 
01:31:39.791 ✔ Generated Prisma Client (v5.22.0) to ./node_modules/@prisma/client in 268ms
01:31:39.791 
01:31:39.791 Start by importing your Prisma Client (See: https://pris.ly/d/importing-client)
01:31:39.791 
01:31:39.791 Tip: Interested in query caching in just a few lines of code? Try Accelerate today! https://pris.ly/tip-3-accelerate
01:31:39.791 
01:31:39.852 ┌─────────────────────────────────────────────────────────┐
01:31:39.853 │  Update available 5.22.0 -> 7.0.0                       │
01:31:39.853 │                                                         │
01:31:39.853 │  This is a major update - please follow the guide at    │
01:31:39.853 │  https://pris.ly/d/major-version-upgrade                │
01:31:39.854 │                                                         │
01:31:39.854 │  Run the following to update                            │
01:31:39.854 │    npm i --save-dev prisma@latest                       │
01:31:39.854 │    npm i @prisma/client@latest                          │
01:31:39.854 └─────────────────────────────────────────────────────────┘
01:31:40.670   ▲ Next.js 14.2.33
01:31:40.671 
01:31:40.739    Creating an optimized production build ...
01:32:02.282  ✓ Compiled successfully
01:32:02.283    Linting and checking validity of types ...
01:32:12.814 Failed to compile.
01:32:12.814 
01:32:12.815 ./app/api/signup/route.ts:84:40
01:32:12.815 Type error: Expected 4-5 arguments, but got 3.
01:32:12.815 
01:32:12.815 [0m [90m 82 |[39m[0m
01:32:12.815 [0m [90m 83 |[39m     [90m// Create user in database[39m[0m
01:32:12.815 [0m[31m[1m>[22m[39m[90m 84 |[39m     [36mconst[39m user [33m=[39m [36mawait[39m [33mDatabaseService[39m[33m.[39msyncWrite([0m
01:32:12.815 [0m [90m    |[39m                                        [31m[1m^[22m[39m[0m
01:32:12.815 [0m [90m 85 |[39m       [32m'create'[39m[33m,[39m[0m
01:32:12.815 [0m [90m 86 |[39m       [90m// Firebase write (PRIMARY)[39m[0m
01:32:12.815 [0m [90m 87 |[39m       [36masync[39m () [33m=>[39m {[0m
01:32:12.839 Next.js build worker exited with code: 1 and signal: null
01:32:12.858 Error: Command "npm run vercel-build" exited with 101:31:30.358 Running build in Washington, D.C., USA (East) – iad1
01:31:30.359 Build machine configuration: 2 cores, 8 GB
01:31:30.478 Cloning github.com/Irfanoffici/CampusEats (Branch: main, Commit: 0c6eac6)
01:31:30.752 Cloning completed: 274.000ms
01:31:32.559 Restored build cache from previous deployment (HZXzXN5FfYyqadzDDawM1W2sfnm9)
01:31:33.359 Running "vercel build"
01:31:33.758 Vercel CLI 48.10.5
01:31:33.932 WARN! Due to `builds` existing in your configuration file, the Build and Development Settings defined in your Project Settings will not apply. Learn More: https://vercel.link/unused-build-settings
01:31:34.112 Installing dependencies...
01:31:37.637 
01:31:37.638 > campuseats@1.0.0 postinstall
01:31:37.638 > prisma generate
01:31:37.638 
01:31:38.120 Prisma schema loaded from prisma/schema.prisma
01:31:38.667 
01:31:38.668 ✔ Generated Prisma Client (v5.22.0) to ./node_modules/@prisma/client in 323ms
01:31:38.668 
01:31:38.668 Start by importing your Prisma Client (See: https://pris.ly/d/importing-client)
01:31:38.668 
01:31:38.668 Tip: Need your database queries to be 1000x faster? Accelerate offers you that and more: https://pris.ly/tip-2-accelerate
01:31:38.668 
01:31:38.856 
01:31:38.856 added 59 packages, removed 18 packages, and changed 26 packages in 4s
01:31:38.857 
01:31:38.857 166 packages are looking for funding
01:31:38.857   run `npm fund` for details
01:31:38.894 Detected Next.js version: 14.2.33
01:31:38.899 Running "npm run vercel-build"
01:31:39.011 
01:31:39.011 > campuseats@1.0.0 vercel-build
01:31:39.011 > prisma generate && next build
01:31:39.011 
01:31:39.353 Prisma schema loaded from prisma/schema.prisma
01:31:39.790 
01:31:39.791 ✔ Generated Prisma Client (v5.22.0) to ./node_modules/@prisma/client in 268ms
01:31:39.791 
01:31:39.791 Start by importing your Prisma Client (See: https://pris.ly/d/importing-client)
01:31:39.791 
01:31:39.791 Tip: Interested in query caching in just a few lines of code? Try Accelerate today! https://pris.ly/tip-3-accelerate
01:31:39.791 
01:31:39.852 ┌─────────────────────────────────────────────────────────┐
01:31:39.853 │  Update available 5.22.0 -> 7.0.0                       │
01:31:39.853 │                                                         │
01:31:39.853 │  This is a major update - please follow the guide at    │
01:31:39.853 │  https://pris.ly/d/major-version-upgrade                │
01:31:39.854 │                                                         │
01:31:39.854 │  Run the following to update                            │
01:31:39.854 │    npm i --save-dev prisma@latest                       │
01:31:39.854 │    npm i @prisma/client@latest                          │
01:31:39.854 └─────────────────────────────────────────────────────────┘
01:31:40.670   ▲ Next.js 14.2.33
01:31:40.671 
01:31:40.739    Creating an optimized production build ...
01:32:02.282  ✓ Compiled successfully
01:32:02.283    Linting and checking validity of types ...
01:32:12.814 Failed to compile.
01:32:12.814 
01:32:12.815 ./app/api/signup/route.ts:84:40
01:32:12.815 Type error: Expected 4-5 arguments, but got 3.
01:32:12.815 
01:32:12.815 [0m [90m 82 |[39m[0m
01:32:12.815 [0m [90m 83 |[39m     [90m// Create user in database[39m[0m
01:32:12.815 [0m[31m[1m>[22m[39m[90m 84 |[39m     [36mconst[39m user [33m=[39m [36mawait[39m [33mDatabaseService[39m[33m.[39msyncWrite([0m
01:32:12.815 [0m [90m    |[39m                                        [31m[1m^[22m[39m[0m
01:32:12.815 [0m [90m 85 |[39m       [32m'create'[39m[33m,[39m[0m
01:32:12.815 [0m [90m 86 |[39m       [90m// Firebase write (PRIMARY)[39m[0m
01:32:12.815 [0m [90m 87 |[39m       [36masync[39m () [33m=>[39m {[0m
01:32:12.839 Next.js build worker exited with code: 1 and signal: null
01:32:12.858 Error: Command "npm run vercel-build" exited with 1