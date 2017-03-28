function pointParamValid(paramString) {
  // paramString = @{lat},{long}
  let regex = /[-\d.]+/gi;
  let matches = paramString.match(regex);
  return matches.length == 2;
};

function pointFromParam(paramString) {
  // paramString = @{lat},{long}
  let regex = /[-\d.]+/gi;
  return paramString.match(regex);
};

module.exports = {
  pointParamValid,
  pointFromParam
}
