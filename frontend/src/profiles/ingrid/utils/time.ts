export function waitSomeTime(timeout = 30) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(null), timeout);
  });
}
