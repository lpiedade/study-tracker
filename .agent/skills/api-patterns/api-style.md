# API Style Selection (2025)

> REST

## Decision Tree

```
Who are the API consumers?
│
└── Public API / Multiple platforms
   └── REST + OpenAPI (widest compatibility)
```

## Selection Questions

1. Who are the API consumers?
2. Is the frontend TypeScript?
3. How complex are the data relationships?
4. Is caching critical?
5. Public or internal API?
