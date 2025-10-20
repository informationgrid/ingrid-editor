export function waitSomeTime(timeout = 10) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(null), timeout);
  });
}
