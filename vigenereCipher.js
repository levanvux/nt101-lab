/**
 * Ý tưởng:
 * - Sử dụng một chuỗi khóa (key) để mã hóa/giải mã văn bản.
 * - Mỗi ký tự trong plaintext được dịch đi một số vị trí trong bảng chữ cái,
 *   số vị trí dịch được quyết định bởi ký tự tương ứng trong key.
 * - Key được lặp lại nếu ngắn hơn văn bản.
 *
 * Quy tắc:
 * - Encrypt: (chỉ số chữ + chỉ số key) mod 26
 * - Decrypt: (chỉ số chữ - chỉ số key + 26) mod 26
 * - Bảo toàn chữ hoa/thường.
 * - Ký tự không phải chữ cái (dấu cách, xuống dòng, dấu câu...) giữ nguyên.
 *
 */

// =======================
// =====Các hàm xử lý=====
// =======================

// chuyển từ chữ cái sang vị trí trong bảng chữ cái
function charToAlphabet(char) {
  const code = char.charCodeAt(0);

  if (code >= 97 && code <= 122) {
    // chữ thường: 'a' = 97
    return { index: code - 97, letterCase: "lower" };
  } else if (code >= 65 && code <= 90) {
    // chữ hoa: 'A' = 65
    return { index: code - 65, letterCase: "upper" };
  }
}

// chuyển từ vị trí trong bảng chữ cái sang chữ cái tương ứng
// eg: index 0 -> 'a' hoặc 'A' tùy theo letterCase
function alphabetIndexToChar(index, letterCase) {
  return letterCase === "lower"
    ? String.fromCharCode(index + 97)
    : String.fromCharCode(index + 65);
}

// =============================
// =====Hàm encrypt/decrypt=====
// =============================
function encryptVigenere(plaintext, key) {
  let encrypted = "";

  let i = 0; // dùng để duyệt qua từng ký tự trong key (lặp lại nếu key ngắn hơn plaintext)

  for (const letter of plaintext) {
    // tìm vị trí trong bảng chữ cái của từng kí tự trong plaintext
    const letterInAlphabet = charToAlphabet(letter);

    // nếu không phải chữ cái thì giữ nguyên
    if (!letterInAlphabet) {
      encrypted += letter;
      continue;
    }

    // tìm vị trí trong bảng chữ cái của ký tự key tương ứng
    const { index: keyIndex } = charToAlphabet(key[i]);

    // dịch sang ký tự tiếp theo của key (lặp lại khi hết key)
    i = (i + 1) % key.length;

    // mã hóa: (vị trí chữ + vị trí key) mod 26
    const modResult = (letterInAlphabet.index + keyIndex) % 26;

    // chuyển vị trí vừa tính ngược lại thành ký tự
    encrypted += alphabetIndexToChar(modResult, letterInAlphabet.letterCase);
  }

  return encrypted;
}

function decryptVigenere(ciphertext, key) {
  let decrypted = "";

  let i = 0; // mục đích tương tự hàm encrypt

  for (const letter of ciphertext) {
    // tìm vị trí trong bảng chữ cái của từng kí tự trong ciphertext
    const letterInAlphabet = charToAlphabet(letter);

    if (!letterInAlphabet) {
      decrypted += letter;
      continue;
    }

    const { index: keyIndex } = charToAlphabet(key[i]);
    i = (i + 1) % key.length;

    // giải mã: (vị trí chữ - vị trí key + 26) mod 26
    const modResult = (letterInAlphabet.index - keyIndex + 26) % 26;

    // chuyển vị trí ngược lại thành chữ cái gốc
    decrypted += alphabetIndexToChar(modResult, letterInAlphabet.letterCase);
  }

  return decrypted;
}

// ========================
// ========= DATA =========
// ========================
const plaintext = `
  nhin quanh lan cuoi
  rung thay la ngam ngui
  rung khong bao tin vui gi
  chi co che man mua
  lang im nhu la
  em khong noi mot loi
  khong khoc khong cuoi
  chi cuon theo chieu gio dua
`;
const key = "networks";

// ============================
// =====Chương trình chính=====
// ============================
console.log(`Key: ${key}\n`);

console.log("Encrypted:");
const ciphertext = encryptVigenere(plaintext, key);
console.log(ciphertext);

console.log("Decrypted:");
console.log(decryptVigenere(ciphertext, key));
