let matrixOn = true;

export function toast(msg: string) {
  window.dispatchEvent(new CustomEvent('am:toast', { detail: msg }));
}

export function toggleMatrix(): boolean {
  matrixOn = !matrixOn;
  window.dispatchEvent(new Event('am:toggle-matrix'));
  return matrixOn;
}

export function isMatrixOn(): boolean {
  return matrixOn;
}
