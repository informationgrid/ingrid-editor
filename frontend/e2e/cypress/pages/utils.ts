export class Utils {
  static randomString(): string {
    return ' - ' + Math.random().toString(36).substring(2, 5);
  }

  static randomdoubleDigitString(): string {
    return Math.floor(Math.random() * 100).toString();
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

  static getHourAndMinute(date: Date): string {
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
}
