declare module 'react-native-html-to-pdf' {
  interface ConvertOptions {
    html: string;
    fileName?: string;
    directory?: string;
    width?: number;
    height?: number;
    base64?: boolean;
    padding?: number;
  }
  interface ConvertResult {
    filePath?: string;
    base64?: string;
  }
  const RNHTMLtoPDF: { convert(options: ConvertOptions): Promise<ConvertResult> };
  export default RNHTMLtoPDF;
}
