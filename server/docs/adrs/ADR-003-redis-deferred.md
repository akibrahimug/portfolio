# ADR-003: Redis Deferred

We avoid Redis initially to minimize cost and complexity. If cross-instance WebSocket broadcasts or rooms are required, we will add Memorystore (Redis) with pub/sub. Until then, single-instance broadcasting suffices.
