export class Utils {
  static randomString(): string {
    return ' - ' + Math.random().toString(36).substring(2, 5);
  }

  static getFormattedDate(date: Date): string {
    let day = date.getDate().toString();
    if (day.length === 1) {
      day = '0' + day;
    }
    let month = (date.getMonth() + 1).toString();
    if (month.length === 1) {
      month = '0' + month;
    }
    return `${day}.${month}.${date.getFullYear()}`;
  }
}
