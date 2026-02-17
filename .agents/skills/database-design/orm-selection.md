# ORM Selection (2025)

> Choose ORM based on deployment and DX needs.

## Decision Tree

```
What's the context?
│
├── Best DX / Schema-first
│   └── Prisma (migrations, studio)
│
└── Maximum control
   └── Raw SQL with query builder
```

## Comparison

| ORM | Best For | Trade-offs |
|-----|----------|------------|
| **Prisma** | DX, schema management | Heavier, not edge-ready |
| **Raw SQL** | Complex queries, control | Manual type safety |
