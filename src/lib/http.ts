export type HttpOptions = {
    baseUrl: string;
    token?: string;
};

export async function httpJson<T>(
    opts: HttpOptions,
    method: "GET" | "POST" | "PUT" | "PATCH",
    path: string,
    body?: unknown
): Promise<T> {
    const url = `${opts.baseUrl.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;

    const headers: Record<string, string> = {
        "Content-Type": "application/json"
    };

    if (opts.token) headers["Authorization"] = `Bearer ${opts.token}`;

    const res = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined
    });

    const text = await res.text();
    if (!res.ok) {
        throw new Error(`HTTP ${res.status} ${res.statusText} @ ${url}\n${text}`);
    }

    return text ? (JSON.parse(text) as T) : ({} as T);
}
