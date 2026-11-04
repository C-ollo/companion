// Prompt files are bundled as plain text (esbuild `text` loader in CDK, a small plugin in vitest).
declare module '*.md' {
  const content: string;
  export default content;
}
