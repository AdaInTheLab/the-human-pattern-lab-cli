import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";

const FrontmatterSchema = z.object({
    id: z.string().optional(),
    type: z.string().optional(),
    title: z.string(),
    subtitle: z.string().optional(),
    published: z.string().optional(),
    tags: z.array(z.string()).optional(),
    summary: z.string().optional(),
    readingTime: z.number().optional(),
    status: z.enum(["published", "draft", "archived"]).optional(),
    dept: z.string().optional(),
    department_id: z.string().optional(),
    shadow_density: z.number().optional(),
    safer_landing: z.boolean().optional(),
    slug: z.string().optional()
});

export type NoteAttributes = {
    title: string;
    subtitle?: string;
    published?: string;
    tags?: string[];
    summary?: string;
    readingTime?: number;
    status?: "published" | "draft" | "archived";
    dept?: string;
    // add more frontmatter fields as needed
    [key: string]: unknown; // allows extra frontmatter keys without breaking
};

export type NotePayload = {
    slug: string;
    locale: string;
    attributes: NoteAttributes;
    markdown: string;
};

function slugFromFilename(filePath: string) {
    const base = path.basename(filePath);
    return base.replace(/\.mdx?$/i, "");
}

export function readNote(filePath: string, locale: string): NotePayload {
    const raw = fs.readFileSync(filePath, "utf-8");
    const parsed = matter(raw);

    const fm = FrontmatterSchema.parse(parsed.data ?? {});
    const slug = (fm.slug && String(fm.slug).trim()) || slugFromFilename(filePath);
    const body = parsed.content.trim();
    const markdown = body.length > 0 ? body : raw.trim();
    // Keep full attributes, but ensure key stuff exists
    const title = (fm.title && String(fm.title).trim()) || "";

    if (!title) {
        throw new Error(`Missing required frontmatter: title (${filePath})`);
    }

    if (!markdown) {
        throw new Error(`Missing required markdown content (${filePath})`);
    }
    return {
        slug,
        locale,
        attributes: { ...fm, slug },
        markdown
    };
}

export function listMarkdownFiles(dir: string): string[] {
    const out: string[] = [];
    const stack = [dir];

    while (stack.length) {
        const d = stack.pop()!;
        const entries = fs.readdirSync(d, { withFileTypes: true });
        for (const e of entries) {
            const p = path.join(d, e.name);
            if (e.isDirectory()) stack.push(p);
            else if (e.isFile() && /\.mdx?$/i.test(e.name)) out.push(p);
        }
    }

    return out.sort();
}
