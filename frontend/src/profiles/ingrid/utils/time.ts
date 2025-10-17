export function waitSomeTime(timeout = 1) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(null), timeout);
  });
}
