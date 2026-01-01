// src/sdk/LabClient.ts

export interface Artifact {
    id: string;
    type: string;
    url: string;
    description?: string;
    created_at?: string;
}

export interface LabNote {
    id: string;
    title: string;
    slug: string;
    category?: string;
    excerpt?: string;
    department_id?: string;

    content?: string; // markdown (or swap to content_html if that’s your truth)
    author?: string;
    status: "draft" | "published" | "archived";

    shadow_density: number;
    coherence_score: number;
    vcs_level?: number;
    safer_landing: boolean;

    read_time_minutes?: number;
    published_at?: string;
    updated_at?: string;

    tags: string[];
    artifacts: Artifact[];
}

export interface CreateOrUpdateNoteInput {
    id?: string;
    title: string;
    slug: string;
    category?: string;
    excerpt?: string;
    department_id?: string;

    content?: string;
    author?: string;
    status?: "draft" | "published" | "archived";

    shadow_density?: number;
    coherence_score?: number;
    vcs_level?: number;
    safer_landing?: boolean;

    read_time_minutes?: number;
    published_at?: string;

    tags?: string[];
    artifacts?: Artifact[];
}

type RequestOpts = Omit<RequestInit, "headers"> & {
    auth?: "bearer" | "cookie" | "none";
    headers?: Record<string, string>;
};

export class LabClient {
    private baseUrl: string;
    private token?: string;

    constructor(baseUrl: string, token?: string) {
        // baseUrl should be like: https://api.thehumanpatternlab.com
        // (no trailing slash, no /api)
        this.baseUrl = baseUrl.replace(/\/$/, "");
        this.token = token;
    }

    setToken(token: string) {
        this.token = token;
    }

    private buildHeaders(extra?: Record<string, string>, auth: RequestOpts["auth"] = "none") {
        const h: Record<string, string> = { ...(extra ?? {}) };

        // Only set JSON content-type when we actually send a JSON body
        // (some servers get weird on GETs with Content-Type set)
        if (!h["Content-Type"]) h["Content-Type"] = "application/json";

        if (auth === "bearer" && this.token) {
            h["Authorization"] = `Bearer ${this.token}`;
        }

        return h;
    }

    private async request<T>(path: string, opts: RequestOpts = {}): Promise<T> {
        const url = `${this.baseUrl}${path.startsWith("/") ? "" : "/"}${path}`;

        const auth = opts.auth ?? "none";
        const headers = this.buildHeaders(opts.headers, auth);

        const res = await fetch(url, {
            ...opts,
            headers,
            credentials: auth === "cookie" ? "include" : opts.credentials,
        });

        // Best-effort parse
        const payload: unknown = await res.json().catch(() => null);

        if (!res.ok) {
            const msg =
                typeof payload === "object" &&
                payload !== null &&
                ("error" in payload || "message" in payload) &&
                typeof (payload as any).error === "string"
                    ? (payload as any).error
                    : typeof (payload as any)?.message === "string"
                        ? (payload as any).message
                        : `Request failed (${res.status})`;

            throw new Error(msg);
        }

        return payload as T;
    }

    //
    // ────────────────────────────────────────────────
    //   PUBLIC ROUTES
    // ────────────────────────────────────────────────
    //

    // ✅ was GET `${baseUrl}/`
    async getAllNotes(): Promise<LabNote[]> {
        return this.request<LabNote[]>("/lab-notes", { method: "GET", auth: "none" });
    }

    // ✅ was GET `${baseUrl}/notes/${slug}`
    async getNoteBySlug(slug: string): Promise<LabNote> {
        return this.request<LabNote>(`/lab-notes/${encodeURIComponent(slug)}`, {
            method: "GET",
            auth: "none",
        });
    }

    //
    // ────────────────────────────────────────────────
    //   ADMIN ROUTES
    // ────────────────────────────────────────────────
    //

    // ✅ was `/api/admin/notes`
    async getAdminNotes(): Promise<LabNote[]> {
        return this.request<LabNote[]>("/admin/notes", {
            method: "GET",
            auth: "cookie",
        });
    }

    // ✅ was `/api/admin/notes`
    async createOrUpdateNote(input: CreateOrUpdateNoteInput): Promise<{ message: string }> {
        return this.request<{ message: string }>("/admin/notes", {
            method: "POST",
            auth: "cookie",
            body: JSON.stringify(input),
        });
    }

    // ✅ was `/api/admin/notes/${id}`
    async deleteNote(id: string): Promise<{ message: string }> {
        return this.request<{ message: string }>(`/admin/notes/${encodeURIComponent(id)}`, {
            method: "DELETE",
            auth: "cookie",
        });
    }

    //
    // ────────────────────────────────────────────────
    //   HEALTH
    // ────────────────────────────────────────────────
    //

    // ✅ was `/api/health`
    async health(): Promise<any> {
        return this.request<any>("/health", { method: "GET", auth: "none" });
    }
}
