/**
 * Ý tưởng:
 * - Bài toán: phá mã Vigenère mà không biết trước khóa.
 * - Cách tiếp cận:
 *   1. Chuẩn hóa ciphertext (chỉ giữ A–Z, viết hoa).
 *   2. Với mỗi độ dài khóa (period) từ 1 → N:
 *      - Chia ciphertext thành nhiều dòng con (mỗi dòng ứng với 1 vị trí khóa).
 *      - Với từng dòng con, thử tất cả shift Caesar (0–25).
 *      - Tính thống kê Chi-squared so với tần suất tiếng Anh.
 *      - Chọn shift có chi2 nhỏ nhất cho dòng đó.
 *   3. Gom lại các shift để suy ra key.
 *   4. Dùng key vừa tìm được để giải mã ciphertext.
 *   5. Sắp xếp và in ra top kết quả (chi2 thấp nhất → plaintext hợp lý nhất).
 *
 * Tham khảo từ: https://www.cipherchallenge.org/wp-content/uploads/2020/12/Five-ways-to-crack-a-Vigenere-cipher.pdf
 */

// ==========================
// ===== Dữ liệu hỗ trợ =====
// ==========================

const ENG_FREQUENCY = {
  A:0.08167,B:0.01492,C:0.02782,D:0.04253,E:0.12702,F:0.02228,
  G:0.02015,H:0.06094,I:0.06966,J:0.00153,K:0.00772,L:0.04025,
  M:0.02406,N:0.06749,O:0.07507,P:0.01929,Q:0.00095,R:0.05987,
  S:0.06327,T:0.09056,U:0.02758,V:0.00978,W:0.02360,X:0.00150,
  Y:0.01974,Z:0.00074
}; // prettier-ignore

const A_CODE = "A".charCodeAt(0);

// =========================
// ===== Các hàm xử lý =====
// =========================

function normalize(text) {
  // Viết hoa toàn bộ, bỏ ký tự ngoài A-Z
  return text.toUpperCase().replace(/[^A-Z]/g, "");
}

function shiftChar(c, s) {
  // Decrypt Caesar với shift có giá trị từ 0 đến 25
  const code = c.charCodeAt(0) - A_CODE;
  const decrypted = (code - s + 26) % 26;
  return String.fromCharCode(decrypted + A_CODE);
}

function shiftText(text, s) {
  // Giải mã cả chuỗi bằng shift s
  let decrypted = "";
  for (let i = 0; i < text.length; i++) decrypted += shiftChar(text[i], s);
  return decrypted;
}

function counts(text) {
  // Đếm tần suất của ký tự A-Z trong chuỗi
  const count = {};
  for (let ch = 0; ch < 26; ch++) count[String.fromCharCode(A_CODE + ch)] = 0;
  for (const char of text) count[char] = (count[char] || 0) + 1;
  return count;
}

function chi2ForCounts(count, N) {
  // Tính thống kê Chi-squared
  let chi2 = 0;
  for (const ch in ENG_FREQUENCY) {
    const O = count[ch] || 0; // tần suất quan sát được
    const E = N * ENG_FREQUENCY[ch]; // tần suất kỳ vọng
    const d = O - E;
    chi2 += (d * d) / E;
  }
  return chi2;
}

function bestShiftForStream(stream) {
  // Tìm shift tốt nhất (chi2 nhỏ nhất) cho 1 dãy con
  const N = stream.length;
  if (N === 0) return { shift: 0, chi2: Infinity };
  let best = { shift: 0, chi2: Infinity };
  for (let shift = 0; shift < 26; shift++) {
    const decrypted = shiftText(stream, shift);
    const count = counts(decrypted);
    const chi2 = chi2ForCounts(count, N);
    if (chi2 < best.chi2) best = { shift, chi2 };
  }
  return best;
}

function splitStreams(text, period) {
  // Chia ciphertext thành period dãy (theo từng vị trí khóa)
  const streams = Array.from({ length: period }, () => "");
  for (let i = 0; i < text.length; i++) {
    streams[i % period] += text[i];
  }
  return streams;
}

function keyFromShifts(shifts) {
  // Chuyển mảng shift thành chuỗi key
  return shifts.map((shift) => String.fromCharCode(A_CODE + shift)).join("");
}

function decryptWithKey(text, key) {
  // Giải mã toàn bộ ciphertext bằng khóa tìm được
  let decrypted = "";
  for (let i = 0; i < text.length; i++) {
    const k = key[i % key.length].charCodeAt(0) - A_CODE;
    decrypted += shiftChar(text[i], k);
  }
  return decrypted;
}

function tryPeriodCipherChi2(cipher, period) {
  // Thử với 1 độ dài khóa
  const streams = splitStreams(cipher, period);
  const shifts = [];
  let totalChi2 = 0;
  for (let j = 0; j < streams.length; j++) {
    const best = bestShiftForStream(streams[j]);
    shifts.push(best.shift);
    totalChi2 += best.chi2;
  }
  const key = keyFromShifts(shifts);
  const plain = decryptWithKey(cipher, key);
  return { period, key, shifts, totalChi2, plain };
}

// ============================
// ==== Chương trình chính ====
// ============================

const ciphertext = `
pp oiuibvql avpgzwm, vyabnwzycbbg klhqla mv uqwckl kzzwktcfcwg hpp
wwftwzcktakah bxjjzcynlu pyzbcgp zzht omnpxtcfckts eahkxwve uvw h uqn wy
ywxy-jtzgp wiejwxubbvpe wiesgp utzvtunpfz va nztuurizf tgemizlu uh etfu fbim htq
bikk va xmvprtyz. mogey lxagdgqgpufck tsialqmooe uzx buqx nhy edsxmviduxape
wyg zlpqlimpqz uvw kkscbts uuavbui mhl oltuzqvhvuiv mv rdibxjv pubt wtupivf, yqv
jkvyecvz vp fbm buvqlvxa czx khuhuxmgakmf khtoghqvhvuivl zwob il jtqxqm jcdx
bkhpeukmpqzm igk gyuqe
`;

const cipher = normalize(ciphertext);

// Thử các độ dài khóa từ 1 đến 12
const candidates = [];
for (let period = 1; period <= Math.min(12, cipher.length); period++) {
  candidates.push(tryPeriodCipherChi2(cipher, period));
}

// Sắp xếp theo tổng chi2 tăng dần
candidates.sort((a, b) => a.totalChi2 - b.totalChi2);

// In ra top kết quả
console.log("Danh sách key tốt nhất xếp theo Chi-squared:");
for (let i = 0; i < Math.min(5, candidates.length); i++) {
  const c = candidates[i];
  console.log(
    `period: ${c.period} \nkey: ${c.key} \ntổng Chi2: ${c.totalChi2.toFixed(
      2
    )} \nplaintext mẫu: ${c.plain.slice(0, 17)}\n`
  );
}

// In plaintext tốt nhất
const best = candidates[0];
console.log("\n==== Kết quả tốt nhất tìm được ====");
console.log("Độ dài khóa:", best.period);
console.log("Khóa tìm được:", best.key);
console.log("Plaintext:\n", best.plain);
