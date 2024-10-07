export default function virtualResourceLoader(this: any) {
  const { source } = this.getOptions();

  return Buffer.from(source as string, 'base64').toString('utf-8');
}
