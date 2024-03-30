export default class CommonHelper {
  static async slugifyProductName(productName: string): Promise<string> {
    return productName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/[\s-]+/g, '-');
  }
}
