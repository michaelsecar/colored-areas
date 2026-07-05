//region Module A (palette color 1)
export function moduleA() {
  return "Module A";
}
//endregion

//region Module B (palette color 2)
export function moduleB() {
  return "Module B";
}
//endregion

//region Module C (palette color 3)
export function moduleC() {
  //region Sub Module C1 (palette color 4)
  export function subC1() {
    return "Sub C1";
  }
  //endregion

  //region Sub Module C2 (palette color 5)
  export function subC2() {
    return "Sub C2";
  }
  //endregion
}
//endregion

//region:red Module D (CSS named color)
export function moduleD() {
  return "Module D";
}
//endregion

//region:#aabbcc Module E (inline hex)
export function moduleE() {
  return "Module E";
}
//endregion
