![Header](https://github.com/user-attachments/assets/98339f15-4e14-44f0-9201-4739841145c6)

Check out our minecraft server where we host different modpacks and more, this is mostly for our friends.

## Building

1. **Clone the repository**

```bash
git clone https://github.com/Wufler/ZeroNetwork.git
cd ZeroNetwork
```

2. **Install dependencies**

```bash
pnpm install
```

3. **Initialize the database with docker**

Have docker installed and copy the `env.example` file and rename it to `.env` and enter your environment variables

```bash
pnpm db:start
```
or
```bash
pnpm db:reset
```

4. **Push the Drizzle schema and seed the database**

```bash
pnpm db:push
```

```bash
pnpm db:seed
```

5. **Start the development server and Drizzle Studio**

```bash
pnpm dev
```

```bash
pnpm studio
```
