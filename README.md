# 📦 Prisma + TypeScript + SQLite Starter

A minimal Node project that uses **Prisma ORM**, **TypeScript (tsx)** and a local **SQLite** database.

## 🛠️ Requirements

| Tool | Version (≥) |
| ---- | ----------- |
| Node | 18          |
| npm  | 8           |

---

## 🚀 Quick start

```bash
git clone <repo>
cd <repo>
cp .env.example .env          # adjust if needed
npm install
npx prisma db push --accept-data-loss   # creates fresh dev.db
npm run seed                  # inserts admin/admin
npm run dev                   # start your app (example)
```

### Default credentials

| username | password |
| -------- | -------- |
| `admin`  | `admin`  |

> 🔐 **Change these immediately in production**—they are for local dev only.

---

## 📂 Project structure

```
.
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── dev.db               # git‑ignored
├── src/
│   └── app.ts
├── .env.example
├── .gitignore
└── package.json
```

---

## 📜 Available scripts

| Command                                 | What it does                                                            |
| --------------------------------------- | ----------------------------------------------------------------------- |
| `npm run dev`                           | Runs the app with tsx (edit `src/index.ts`).                            |
| `npx prisma db push --accept-data-loss` | Syncs schema into DB without migrations.                                |
| `npx prisma migrate dev --name <msg>`   | Creates & applies a migration.                                          |
| `npm run seed`                          | Executes `prisma/seed.ts` via tsx, upserting the admin user.            |
| `npm run reset`                         | Removes `dev.db` & migrations, then pushes and seeds (add this script). |

---

## 🧹 Resetting the database

```bash
rm prisma/dev.db
npx prisma db push --accept-data-loss
npm run seed
```

Or with migrations:

```bash
rm -rf prisma/migrations prisma/dev.db
npx prisma migrate dev --name init
npm run seed
```

---

## ✍️ Environment variables

| Var              | Example                | Purpose              |
| ---------------- | ---------------------- | -------------------- |
| `DATABASE_URL`   | `file:./prisma/dev.db` | Path to SQLite file. |
| `ADMIN_USERNAME` | `admin`                | Seed admin username. |
| `ADMIN_PASSWORD` | `admin`                | Seed admin password. |

Copy **`.env.example`** to `.env` and customise.

---

## 🏗️ Extending the schema

1. Edit `prisma/schema.prisma`.
2. Run `npx prisma migrate dev --name <change>` (or `db push`).
3. Update code in `src/`.
4. Reseed if necessary.

---

Happy coding! 🎉
