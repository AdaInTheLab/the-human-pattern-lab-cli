"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadMarkdown = loadMarkdown;
const fs_1 = __importDefault(require("fs"));
const gray_matter_1 = __importDefault(require("gray-matter"));
function loadMarkdown(filePath) {
    const raw = fs_1.default.readFileSync(filePath, 'utf8');
    const parsed = (0, gray_matter_1.default)(raw);
    return {
        content: parsed.content.trim(),
        metadata: parsed.data
    };
}
