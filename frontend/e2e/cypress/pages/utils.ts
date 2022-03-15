export class Utils {
  static MILLISECONDS_IN_DAY = 24 * 60 * 60 * 1000;

  static randomString(): string {
    return ' - ' + Math.random().toString(36).substring(2, 5);
  }

  static randomDoubleDigitString(): string {
    return Math.floor(Math.random() * 100).toString();
  }

  /**
   * format date like: 'yyyy-MM-dd'
   * @param date
   */
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

  /**
   * format date like: 'HH:mm'
   * @param date
   */
  static getFormattedTime(date: Date): string {
    let hours = date.getHours().toString();
    let minutes = date.getMinutes().toString();
    if (hours.length === 1) {
      hours = '0' + hours;
    }
    if (minutes.length === 1) {
      minutes = '0' + minutes;
    }
    return `${hours}:${minutes}`;
  }

  /**
   * format date like: 'yyyy-MM-dd HH:mm'
   * @param date
   */
  static getFormattedDateTime(date: Date): string {
    return `${this.getFormattedDate(date)} ${this.getFormattedTime(date)}`;
  }
}
