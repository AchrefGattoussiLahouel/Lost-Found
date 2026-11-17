export function clamp(x) {
  return Math.min(Math.max(x, 0), 1);
}


export function cosine(a, b){
    return dot(a, b) / (norm2(a) * norm2(b));
}


export function dot(a, b) {
  return a.reduce((acc, val, i) => acc + val * b[i], 0);
}


export function norm2(v) {
  return Math.hypot(...v);
}