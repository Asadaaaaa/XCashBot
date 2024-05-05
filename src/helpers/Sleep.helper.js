export default (milisecond) => {
  return new Promise((resolve) => {
    setTimeout(resolve, milisecond);
  });
}
