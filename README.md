![Header](https://github.com/user-attachments/assets/98339f15-4e14-44f0-9201-4739841145c6)

Check out our minecraft server where we host different modpacks and more, this is mostly for our friends.

## Building

1. **Clone the repository**

```bash
git clone https://github.com/WoIfey/ZeroNetwork.git
cd ZeroNetwork
```

2. **Install dependencies**

```bash
pnpm install
```

3. **Initialize the database with docker**

Copy the `env.example` file and rename it to `.env`:

```bash
pnpm db:start
```

4. **Run database migrations and seed it**

```bash
pnpm prisma
```

```bash
pnpm db:seed
```

5. **Start the development server and prisma studio**

```bash
pnpm dev
```

```bash
pnpm studio or npx prisma studio
```
