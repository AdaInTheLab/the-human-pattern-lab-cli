// tests/json-output.test.ts
import { execa } from "execa";
import { describe, expect, it } from 'vitest';

describe("CLI --json output contract", () => {
    it("emits valid JSON only on stdout", async () => {
        const result = await execa(
            "tsx",
            ["./bin/hpl.ts", "--json", "version"],
            {
                reject: false,
                all: false, // do NOT merge stdout/stderr
            }
        );

        // Debug output
        if (result.exitCode !== 0) {
            console.log("Exit code:", result.exitCode);
            console.log("stdout:", result.stdout);
            console.log("stderr:", result.stderr);
        }

        // 1. Process must succeed
        expect(result.exitCode).toBe(0);

        // 2. stdout must be valid JSON
        expect(() => JSON.parse(result.stdout)).not.toThrow();

        // 3. stdout must start with { or [
        const trimmed = result.stdout.trim();
        expect(trimmed.startsWith("{") || trimmed.startsWith("[")).toBe(true);
    });
});
