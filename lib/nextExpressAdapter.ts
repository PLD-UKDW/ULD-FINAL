type ExpressLikeHandler = (req: any, res: any, next?: (error?: unknown) => void) => unknown | Promise<unknown>;

type AdapterOptions = {
  request: Request;
  params?: Record<string, string>;
  body?: unknown;
  files?: unknown;
  file?: unknown;
  user?: unknown;
};

async function parseRequestBody(request: Request) {
  if (request.method === "GET" || request.method === "HEAD") {
    return undefined;
  }

  const contentType = request.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) {
    return undefined;
  }

  try {
    return await request.json();
  } catch {
    return undefined;
  }
}

export async function callExpressHandler(handler: ExpressLikeHandler, options: AdapterOptions) {
  if (typeof handler !== "function") {
    console.error("[callExpressHandler] handler is not a function", { handler });
    return Response.json({ message: "Internal server error: handler is not a function" }, { status: 500 });
  }
  const body = options.body !== undefined ? options.body : await parseRequestBody(options.request);
  const searchParams = new URL(options.request.url).searchParams;
  const query = Object.fromEntries(searchParams.entries());

  let statusCode = 200;
  let response: Response | null = null;
  let nextError: unknown = null;

  const res = {
    status(code: number) {
      statusCode = code;
      return res;
    },
    json(data: unknown) {
      response = Response.json(data, { status: statusCode });
      return response;
    },
    send(data?: unknown) {
      if (data === undefined || data === null) {
        response = new Response(null, { status: statusCode });
        return response;
      }

      if (typeof data === "string") {
        response = new Response(data, {
          status: statusCode,
          headers: { "content-type": "text/plain; charset=utf-8" },
        });
        return response;
      }

      response = Response.json(data, { status: statusCode });
      return response;
    },
  };

  const next = (error?: unknown) => {
    nextError = error ?? new Error("Unhandled route error");
  };

  const req = {
    body,
    files: options.files,
    file: options.file,
    user: options.user,
    params: options.params ?? {},
    query,
    headers: Object.fromEntries(options.request.headers.entries()),
    method: options.request.method,
    url: options.request.url,
  };

  const result = await handler(req, res, next);

  if (result instanceof Response) {
    return result;
  }

  if (nextError) {
    console.error("[callExpressHandler] Error from next():", nextError);
    
    let message = "Internal server error";
    if (nextError instanceof Error) {
      message = nextError.message;
    } else if (typeof nextError === "string") {
      message = nextError;
    } else if (nextError && typeof nextError === "object") {
      const errorObj = nextError as Record<string, any>;
      message = errorObj.message || errorObj.msg || String(errorObj);
    }
    
    return Response.json({ message }, { status: 500 });
  }

  return response ?? Response.json({ message: "Internal server error" }, { status: 500 });
}