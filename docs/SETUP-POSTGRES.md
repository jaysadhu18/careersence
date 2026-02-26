# Step-by-step: PostgreSQL & app setup

Follow these steps in order.

---

## Step 1: Open pgAdmin and connect to PostgreSQL

1. Open **pgAdmin** on your computer.
2. In the left sidebar, expand **Servers**.
3. Click your **PostgreSQL server** (e.g. "PostgreSQL 16").
4. Enter the **password** if asked (this is your PostgreSQL user password).
5. You should see **Databases**, **Login/Group Roles**, etc. under the server.

---

## Step 2: Create the database

1. **Right-click** on **Databases** (under your server).
2. Click **Create** → **Database**.
3. In the **Database** field, type: `careersence`
4. **Owner** can stay as `postgres` (default).
5. Click **Save**.

You should now see **careersence** under Databases.

---

## Step 3: Get your connection details

1. In the left sidebar, **right-click your server** (the one you connected to in Step 1).
2. Click **Properties**.
3. Open the **Connection** tab.
4. Write down:
   - **Host name/address** (often `localhost` or `127.0.0.1`)
   - **Port** (often `5432`)
   - **Maintenance database** (can ignore; we use `careersence`)
   - **Username** (often `postgres`)
5. You already know the **password** (the one you used to connect in Step 1).
6. Click **Cancel** or **OK** to close.

---

## Step 4: Build the PostgreSQL URL

Use this format:

```
postgresql://USERNAME:PASSWORD@HOST:PORT/careersence?schema=public
```

Replace:

| Placeholder  | Use this                          | Example    |
|-------------|------------------------------------|------------|
| USERNAME    | From Step 3 (Username)             | `postgres` |
| PASSWORD    | Your PostgreSQL user password     | `admin123` |
| HOST        | From Step 3 (Host name/address)   | `localhost`|
| PORT        | From Step 3 (Port)                 | `5432`     |

**Example:**  
If username is `postgres`, password is `admin123`, host is `localhost`, port is `5432`:

```
postgresql://postgres:admin123@localhost:5432/careersence?schema=public
```

**If your password has special characters** (e.g. `@`, `#`, `%`), replace them:

- `@` → `%40`
- `#` → `%23`
- `%` → `%25`

Example: password `p@ss#1` → use `p%40ss%231` in the URL.

---

## Step 5: Set environment variables

1. Open the file **`.env.local`** in the project root (same folder as `package.json`).
2. Set or update these lines:

```env
# Paste the URL you built in Step 4 (inside quotes)
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/careersence?schema=public"

# Generate a secret: open terminal and run: openssl rand -base64 32
# Then paste the output below (no quotes)
NEXTAUTH_SECRET=paste_the_32_character_output_here

# For local development keep this as is
NEXTAUTH_URL=http://localhost:3000
```

3. Replace `YOUR_PASSWORD` in `DATABASE_URL` with your real PostgreSQL password (or the encoded version if it has special characters).
4. Replace `paste_the_32_character_output_here` with the output of `openssl rand -base64 32`.
5. Save the file.

---

## Step 6: Generate NEXTAUTH_SECRET (if you haven’t)

1. Open a **terminal** (in the project folder or any folder).
2. Run:

```bash
openssl rand -base64 32
```

3. Copy the **entire line** that appears (e.g. `K7gN2mP9xR4vY8wQ1sL5jH0cF3bT6uA...`).
4. In `.env.local`, set:

```env
NEXTAUTH_SECRET=K7gN2mP9xR4vY8wQ1sL5jH0cF3bT6uA...
```

(Use your actual output, not this example.)

---

## Step 7: Install dependencies and create tables

1. Open a terminal in the project folder: `careersence`.
2. Run:

```bash
npm install
```

3. Then run migrations to create the `User` table in the `careersence` database:

```bash
npx prisma migrate deploy
```

4. You should see something like: **Applied 1 migration(s)**.

---

## Step 8: Verify in pgAdmin (optional)

1. In pgAdmin, refresh the tree: right-click **Databases** → **Refresh**.
2. Expand **careersence** → **Schemas** → **public** → **Tables**.
3. You should see a table named **User**.  
   Right-click **User** → **View/Edit Data** → **All Rows** to see data after users sign up.

---

## Step 9: Run the app

1. In the same project folder, run:

```bash
npm run dev
```

2. Open a browser and go to: **http://localhost:3000**
3. You should see the **landing page**.
4. Click **Sign up**, create an account (name, email, password, role).
5. After signup you should be redirected to the **Overview**.
6. In pgAdmin, check the **User** table (Step 8) — you should see your new user row.

---

## Troubleshooting

| Problem | What to do |
|--------|------------|
| `DATABASE_URL` / connection error | Check username, password, host, port in `.env.local`. Ensure the `careersence` database exists in pgAdmin. |
| `Environment variable not found: DATABASE_URL` | Prisma reads `.env` or `.env.local`; make sure the variable is in `.env.local` in the **project root** (inside `careersence`). |
| `Migration failed` | Ensure PostgreSQL is running and you can connect in pgAdmin with the same user/password. |
| Sign up fails / 500 error | Check terminal or server logs; confirm `npx prisma migrate deploy` completed and the **User** table exists. |

---

## Quick checklist

- [ ] pgAdmin open and connected to PostgreSQL  
- [ ] Database `careersence` created  
- [ ] Connection details (host, port, username, password) noted  
- [ ] `DATABASE_URL` in `.env.local` with correct values  
- [ ] `NEXTAUTH_SECRET` in `.env.local` (from `openssl rand -base64 32`)  
- [ ] `npm install` run  
- [ ] `npx prisma migrate deploy` run (1 migration applied)  
- [ ] `npm run dev` run and http://localhost:3000 opens  
- [ ] Sign up works and user appears in pgAdmin **User** table  
