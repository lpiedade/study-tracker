# Database Selection (2025)

> Choose database based on context, not default.

## Decision Tree

```
What are your requirements?
│
├── Full relational features needed
│   └── Self-hosted → PostgreSQL
│
└── Simple / Embedded / Local
   └── SQLite

```

## Comparison

| Database | Best For | Trade-offs |
|----------|----------|------------|
| **PostgreSQL** | Full features, complex queries | Needs hosting |
| **SQLite** | Simple, embedded, local | Single-writer |

## Questions to Ask

1. What's the deployment environment?
2. How complex are the queries?
3. Is edge/serverless important?
4. Vector search needed?
5. Global distribution required?
