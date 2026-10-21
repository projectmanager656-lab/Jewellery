export class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export function notFound(_req, res) {
  res.status(404).json({ error: "Not found." });
}

export function errorHandler(error, _req, res, _next) {
  if (res.headersSent) return;
  if (error?.code === 11000) {
    res.status(409).json({ error: "A record with that unique value already exists." });
    return;
  }
  if (error?.name === "ValidationError") {
    res.status(400).json({ error: "Validation failed.", details: Object.values(error.errors).map((item) => item.message) });
    return;
  }
  if (error?.name === "CastError") {
    res.status(400).json({ error: "Invalid record identifier." });
    return;
  }
  if (error?.name === "MulterError" || error?.name === "ZodError") {
    res.status(400).json({ error: error.message });
    return;
  }
  if (error instanceof HttpError) {
    res.status(error.status).json({ error: error.message, ...(error.details ? { details: error.details } : {}) });
    return;
  }
  console.error("Unhandled API error:", error?.name ?? "Error");
  res.status(500).json({ error: "An unexpected server error occurred." });
}
