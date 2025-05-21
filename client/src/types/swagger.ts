export interface SwaggerDefinition {
  openapi?: string;
  swagger?: string;
  info: {
    title: string;
    version: string;
    description?: string;
  };
  paths: Record<string, {
    get?: Record<string, unknown>;
    post?: Record<string, unknown>;
    put?: Record<string, unknown>;
    delete?: Record<string, unknown>;
    patch?: Record<string, unknown>;
    options?: Record<string, unknown>;
    head?: Record<string, unknown>;
  }>;
  components?: {
    schemas?: Record<string, unknown>;
    responses?: Record<string, unknown>;
    parameters?: Record<string, unknown>;
    requestBodies?: Record<string, unknown>;
  };
}