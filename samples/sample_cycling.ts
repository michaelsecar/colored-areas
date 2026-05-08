//region: Module A (uses palette color 1)
export function moduleA() {
  return "Module A";
}
//endregion

//region: Module B (uses palette color 2)
export function moduleB() {
  return "Module B";
}
//endregion

//region: Module C (uses palette color 3)
export function moduleC() {
  //region: Sub Module C1 (uses palette color 4)
  export function subC1() {
    return "Sub C1";
  }
  //endregion

  //region: Sub Module C2 (uses palette color 5)
  export function subC2() {
    return "Sub C2";
  }
  //endregion
}
//endregion

//region: red Module D (uses CSS named color)
export function moduleD() {
  return "Module D";
}
//endregion

//region: #aabbcc Module E (uses inline hex)
export function moduleE() {
  return "Module E";
}
//endregion
