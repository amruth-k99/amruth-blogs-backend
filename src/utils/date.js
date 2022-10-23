const getDate = () => {
  const day = new Date().getDate();
  const month = new Date().getMonth() + 1;
  const year = new Date().getFullYear();
  return `${year}-${month}-${day}`;
};

/*
 * @returns {String} time in format hh-mm-ss
 */
const getTime = () => {
  const hours = new Date().getHours();
  const minutes = new Date().getMinutes();
  const seconds = new Date().getSeconds();
  return `${hours}:${minutes}:${seconds}`;
};

module.exports = {
  getDate,
  getTime,
};
