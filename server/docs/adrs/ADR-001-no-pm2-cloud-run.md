# ADR-001: No PM2 on Cloud Run

Cloud Run manages the process lifecycle and signals. Running multiple processes via PM2 complicates graceful shutdown and can conflict with Cloud Run's SIGTERM handling. We run a single Node process per container and rely on Cloud Run for scaling and lifecycle.
