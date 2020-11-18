export class Utils {
  static randomString(): string {
    return ' - ' + Math.random().toString(36).substring(2, 5);
  }
}
