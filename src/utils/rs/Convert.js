const Convert = {};

Convert.ToInt = (value) => {
  return parseInt(value);
}

Convert.ToJson = (value) => {
  if (value === undefined || value === null) {
    return null;
  }
  return JSON.stringify(value);
}

Convert.ToObject = (value) => {
  if (value === undefined || value === null) {
    return null;
  }
  return JSON.parse(value);
}

export default Convert;
