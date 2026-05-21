// Lightweight pure JavaScript/TypeScript MD5 implementation for Gravatar support

function md5cycle(x: number[], k: number[]) {
  let a = x[0], b = x[1], c = x[2], d = x[3];

  a = ff(a, b, c, d, k[0], 7, -680876936);
  d = ff(d, a, b, c, k[1], 12, -389564586);
  c = ff(c, d, a, b, k[2], 17, 606105819);
  b = ff(b, c, d, a, k[3], 22, -1044525330);
  a = ff(a, b, c, d, k[4], 7, -176418897);
  d = ff(d, a, b, c, k[5], 12, 1200080426);
  c = ff(c, d, a, b, k[6], 17, -1473231341);
  b = ff(b, c, d, a, k[7], 22, -45705983);
  a = ff(a, b, c, d, k[8], 7, 1770035416);
  d = ff(d, a, b, c, k[9], 12, -1958414417);
  c = ff(c, d, a, b, k[10], 17, -42063);
  b = ff(b, c, d, a, k[11], 22, -1990404162);
  a = ff(a, b, c, d, k[12], 7, 1804603682);
  d = ff(d, a, b, c, k[13], 12, -40341101);
  c = ff(c, d, a, b, k[14], 17, -1502002290);
  b = ff(b, c, d, a, k[15], 22, 1236535329);

  a = gg(a, b, c, d, k[1], 5, -165796510);
  d = gg(d, a, b, c, k[6], 9, -1069501632);
  c = gg(c, d, a, b, k[11], 14, 643717713);
  b = gg(b, c, d, a, k[0], 20, -373897302);
  a = gg(a, b, c, d, k[5], 5, -701558691);
  d = gg(d, a, b, c, k[10], 9, 38016083);
  c = gg(c, d, a, b, k[15], 14, -660478335);
  b = gg(b, c, d, a, k[4], 20, -405537848);
  a = gg(a, b, c, d, k[9], 5, 568446438);
  d = gg(d, a, b, c, k[14], 9, -1019803690);
  c = gg(c, d, a, b, k[3], 14, -187363961);
  b = gg(b, c, d, a, k[8], 20, 1163531501);
  a = gg(a, b, c, d, k[13], 5, -1444681467);
  d = gg(d, a, b, c, k[2], 9, -51403784);
  c = gg(c, d, a, b, k[7], 14, 1735328473);
  b = gg(b, c, d, a, k[12], 20, -1926607734);

  a = hh(a, b, c, d, k[5], 4, -378558);
  d = hh(d, a, b, c, k[8], 11, -2022574463);
  c = hh(c, d, a, b, k[11], 16, 1839030562);
  b = hh(b, c, d, a, k[14], 23, -35309556);
  a = hh(a, b, c, d, k[1], 4, -1530992060);
  d = hh(d, a, b, c, k[4], 11, 1272893353);
  c = hh(c, d, a, b, k[7], 16, -155497632);
  b = hh(b, c, d, a, k[10], 23, -1094730640);
  a = hh(a, b, c, d, k[13], 4, 681279174);
  d = hh(d, a, b, c, k[0], 11, -358537222);
  c = hh(c, d, a, b, k[3], 16, -722521979);
  b = hh(b, c, d, a, k[6], 23, 76029189);
  a = hh(a, b, c, d, k[9], 4, -640364487);
  d = hh(d, a, b, c, k[12], 11, -421815835);
  c = hh(c, d, a, b, k[15], 16, 530742520);
  b = hh(b, c, d, a, k[2], 23, -995338651);

  x[0] = add32(a, x[0]);
  x[1] = add32(b, x[1]);
  x[2] = add32(c, x[2]);
  x[3] = add32(d, x[3]);
}

function cmn(q: number, a: number, b: number, x: number, s: number, t: number) {
  a = add32(add32(a, q), add32(x, t));
  return add32((a << s) | (a >>> (32 - s)), b);
}

function ff(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
  return cmn((b & c) | ((~b) & d), a, b, x, s, t);
}

function gg(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
  return cmn((b & d) | (c & (~d)), a, b, x, s, t);
}

function hh(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
  return cmn(b ^ c ^ d, a, b, x, s, t);
}

function ii(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
  return cmn(c ^ (b | (~d)), a, b, x, s, t);
}

function md51(s: string) {
  const n = s.length;
  const state = [1732584193, -271733879, -1732584194, 271733878];
  let i = 64;
  for (; i <= s.length; i += 64) {
    md5cycle(state, md5blk(s.substring(i - 64, i)));
  }
  const tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  const remaining = s.substring(i - 64);
  let j = 0;
  for (; j < remaining.length; j++) {
    tail[j >> 2] |= remaining.charCodeAt(j) << ((j & 3) << 3);
  }
  tail[j >> 2] |= 0x80 << ((j & 3) << 3);
  if (j > 55) {
    md5cycle(state, tail);
    for (let k = 0; k < 16; k++) tail[k] = 0;
  }
  tail[14] = n * 8;
  md5cycle(state, tail);
  return state;
}

function md5blk(s: string) {
  const r: number[] = [];
  for (let i = 0; i < 64; i += 4) {
    r[i >> 2] = s.charCodeAt(i)
      | (s.charCodeAt(i + 1) << 8)
      | (s.charCodeAt(i + 2) << 16)
      | (s.charCodeAt(i + 3) << 24);
  }
  return r;
}

const hex_chr = '0123456789abcdef'.split('');

function rhex(n: number) {
  let s = '', j = 0;
  for (; j < 4; j++) {
    s += hex_chr[(n >> (j * 8 + 4)) & 0x0f]
      + hex_chr[(n >> (j * 8)) & 0x0f];
  }
  return s;
}

function hex(x: number[]) {
  const arr = [...x];
  for (let i = 0; i < arr.length; i++) {
    arr[i] = rhex(arr[i]) as any;
  }
  return arr.join('');
}

export function md5(s: string) {
  return hex(md51(s));
}

function add32(a: number, b: number) {
  return (a + b) & 0xFFFFFFFF;
}

export function getGravatarUrl(email: string | null | undefined): string | null {
  if (!email) return null;
  const cleanEmail = email.trim().toLowerCase();
  const hash = md5(cleanEmail);
  return `https://www.gravatar.com/avatar/${hash}?d=404`;
}
