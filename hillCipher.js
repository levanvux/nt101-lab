/**
 * Ý tưởng:
 * - Bước 1: Chuyển mỗi chữ cái thành số (A=1, B=2, ..., Z=26).
 * - Bước 2: Từ khóa (key) được dùng để tạo thành một ma trận vuông (kích thước n×n).
 *   + Kiểm tra ma trận có khả nghịch theo modulo 26 (bắt buộc để có thể giải mã).
 * - Bước 3: Plaintext được chia thành các khối n ký tự, nếu thiếu thì padding bằng 'Z'.
 * - Bước 4: Mã hóa = nhân vector plaintext với ma trận key theo modulo 26.
 * - Bước 5: Giữ nguyên các ký tự không thuộc bảng chữ cái (khoảng trắng, dấu...).
 * - Bước 6: Giải mã = dùng ma trận nghịch đảo modulo 26 để nhân ngược lại ciphertext.
 *
 * Kết quả: ciphertext có thể giải mã về plaintext gốc (trừ ký tự padding thêm).
 */

// ===========================
// ======Các hàm hỗ trợ=======
// ===========================

// chuyển từ chữ cái sang vị trí trong bảng chữ cái ('a'/'A' -> 01)
function charToAlphabet(char) {
  const code = char.charCodeAt(0);

  if (code >= 97 && code <= 122) {
    return { index: code - 96, letterCase: "lower" };
  } else if (code >= 65 && code <= 90) {
    return { index: code - 64, letterCase: "upper" };
  }
  return null;
}

// chuyển từ vị trí trong bảng chữ cái sang chữ cái tương ứng
function alphabetIndexToChar(index, letterCase = "lower") {
  if (index === 0) {
    return letterCase === "lower" ? "z" : "Z";
  }
  return letterCase === "lower"
    ? String.fromCharCode(index + 96)
    : String.fromCharCode(index + 64);
}

function buildMatrixFromKey(key, size) {
  if (size < 1 || size > 5) {
    throw new Error("Kích thước ma trận Hill chỉ hỗ trợ từ 1 đến 5.");
  }

  // chuẩn hóa key: bỏ khoảng trắng, uppercase, loại trùng
  const elements = [...key.replace(/\s+/g, "").toUpperCase()];

  if (elements.length < size * size) {
    throw new Error("Độ dài key không đủ để tạo ma trận.");
  }
  // tạo ma trận từ key
  const matrix = [];
  for (let i = 0; i < size; i++) {
    const row = [];
    for (let j = 0; j < size; j++) {
      const { index } = charToAlphabet(elements[i * size + j]);
      row.push(index);
    }
    matrix.push(row);
  }

  if (!isInvertibleMod26(matrix)) {
    throw new Error(
      "Ma trận được tạo từ key không khả nghịch theo modulo 26. Vì vậy không thể sử dụng key này cho Hill cipher."
    );
  }

  return matrix;
}

// chuyển plaintext → vector (chia block, padding bằng Z)
function textToVector(text, size) {
  // bỏ khoảng trắng, uppercase
  let cleaned = text.replace(/\s+/g, "");

  // padding cho đủ block
  const padLength = (size - (cleaned.length % size)) % size;
  cleaned += "Z".repeat(padLength);

  const vector = [];
  for (let i = 0; i < cleaned.length; i += size) {
    const block = [];
    for (let j = 0; j < size; j++) {
      block.push(charToAlphabet(cleaned[i + j]).index);
    }
    vector.push(block);
  }
  return vector;
}

// Chuyển text thành block nhưng giữ nguyên khoảng trắng/ký tự đặc biệt
function textToVectorPreserveSpaces(text, size) {
  const letterCount = text.replace(/\s+/g, "").length;
  const padLength = (size - (letterCount % size)) % size;
  const padded = text + "Z".repeat(padLength);

  const vector = [];
  let block = [];
  let count = 0;

  for (const char of padded) {
    const alphabet = charToAlphabet(char);

    // lưu object {index,...} hoặc ký tự thường
    if (alphabet) {
      count++;
      block.push(alphabet);
    } else {
      block.push(char);
    }

    if (count === size) {
      vector.push(block);
      block = [];
      count = 0;
    }
  }

  return vector;
}

// chuyển vector về text
function vectorToText(vector) {
  return vector
    .flat()
    .map((e) =>
      e.index !== undefined ? alphabetIndexToChar(e.index, e.letterCase) : e
    )
    .join("");
}

// Kiểm tra xem ma trận có khả nghịch theo modulo 26 hay không
function isInvertibleMod26(matrix) {
  const mod = 26;
  const modNorm = (x) => ((x % mod) + mod) % mod;

  function gcd(a, b) {
    while (b !== 0) [a, b] = [b, a % b];
    return Math.abs(a);
  }

  function determinant(mat) {
    const n = mat.length;
    if (n === 1) return modNorm(mat[0][0]);
    if (n === 2) return modNorm(mat[0][0] * mat[1][1] - mat[0][1] * mat[1][0]);
    let det = 0;
    for (let j = 0; j < n; j++) {
      const minor = mat.slice(1).map((r) => r.filter((_, c) => c !== j));
      det += (j % 2 ? -1 : 1) * mat[0][j] * determinant(minor);
    }
    return modNorm(det);
  }

  return gcd(determinant(matrix), mod) === 1; // true nếu nghịch đảo tồn tại
}

// Tìm ma trận nghịch đảo trong modulo 26
function inverseMatrixMod26(matrix) {
  const mod = 26;

  // Extended Euclidean Algorithm: trả về gcd và hệ số Bézout
  function egcd(a, b) {
    if (a === 0) return [b, 0, 1];
    const [g, x1, y1] = egcd(b % a, a);
    return [g, y1 - Math.floor(b / a) * x1, x1];
  }

  // Tìm modular inverse của a theo mod
  function modInverse(a, mod) {
    const [g, x] = egcd(((a % mod) + mod) % mod, mod);
    if (g !== 1) throw new Error("Determinant không khả nghịch modulo " + mod);
    return ((x % mod) + mod) % mod;
  }

  // Tính determinant (theo Laplace expansion, không mod ở giữa)
  function determinant(mat) {
    const n = mat.length;
    if (n === 1) return mat[0][0];
    if (n === 2) return mat[0][0] * mat[1][1] - mat[0][1] * mat[1][0];
    let det = 0;
    for (let j = 0; j < n; j++) {
      const minor = mat
        .slice(1)
        .map((row) => row.filter((_, col) => col !== j));
      det += (j % 2 === 0 ? 1 : -1) * mat[0][j] * determinant(minor);
    }
    return det;
  }

  // Tính adjugate matrix = transpose của ma trận cofactor
  function adjugate(mat) {
    const n = mat.length;
    const adj = Array.from({ length: n }, () => Array(n).fill(0));

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const minor = mat
          .filter((_, row) => row !== i)
          .map((row) => row.filter((_, col) => col !== j));

        const cofactor = ((i + j) % 2 === 0 ? 1 : -1) * determinant(minor);
        adj[j][i] = ((cofactor % mod) + mod) % mod; // transpose + mod chuẩn hóa
      }
    }
    return adj;
  }

  const det = ((determinant(matrix) % mod) + mod) % mod; // chuẩn hóa det
  const detInv = modInverse(det, mod); // modular inverse của det
  const adj = adjugate(matrix); // adjugate matrix

  // Kết quả = (detInv * adjugate) mod 26
  return adj.map((row) => row.map((value) => (detInv * value) % mod));
}

function printMatrix(matrix) {
  console.log("-".repeat(matrix.length * 4 + 1)); // In đường viền ngang

  for (const row of matrix) {
    let line = "|";
    for (const cell of row) {
      line += " " + cell + " |"; // In từng ký tự theo hàng
    }
    console.log(line);
    console.log("-".repeat(matrix.length * 4 + 1));
  }
}

// ==============================
// =====Hill encrypt/decrypt=====
// ==============================

function encryptHill(plaintext, keyMatrix) {
  const size = keyMatrix.length;
  const vector = textToVector(plaintext, size);
  const vectorPreserveSpaces = textToVectorPreserveSpaces(plaintext, size);
  const encryptedVector = [];

  for (let i = 0; i < vectorPreserveSpaces.length; i++) {
    const block = vectorPreserveSpaces[i];
    let newBlock = [];

    let j = 0;
    while (block.length !== 0) {
      const element = block.shift();

      if (element.index) {
        let newIndex = 0;
        for (let k = 0; k < size; k++) {
          newIndex += vector[i][k] * keyMatrix[j][k];
        }
        newIndex %= 26;
        newBlock.push({ ...element, index: newIndex });

        j++;
        if (j === size) {
          encryptedVector.push(newBlock);
          newBlock = [];
          j = 0;
        }
      } else {
        newBlock.push(element);
      }
    }
  }

  return encryptedVector;
}

function decryptHill(ciphertext, keyMatrix) {
  const size = keyMatrix.length;
  const inversedMatrix = inverseMatrixMod26(keyMatrix);
  const vector = textToVector(ciphertext, size);
  const vectorPreserveSpaces = textToVectorPreserveSpaces(ciphertext, size);
  const decryptedVector = [];

  for (let i = 0; i < vectorPreserveSpaces.length; i++) {
    const block = vectorPreserveSpaces[i];
    let newBlock = [];

    let j = 0;
    while (block.length !== 0) {
      const element = block.shift();

      if (element.index) {
        let newIndex = 0;
        for (let k = 0; k < size; k++) {
          newIndex += vector[i][k] * inversedMatrix[j][k];
        }
        newIndex %= 26;
        newBlock.push({ ...element, index: newIndex });

        j++;
        if (j === size) {
          decryptedVector.push(newBlock);
          newBlock = [];
          j = 0;
        }
      } else {
        newBlock.push(element);
      }
    }
  }

  return decryptedVector;
}

// ================
// ===== DATA =====
// ================

const plaintext = `
  Nhung ngay chua nhap ngu
  Anh hay dat em ve 
  Vung ngoai o co co bong may
  O day em vang thua nguoi 
  Con ta voi troi
  Thoi gian vao dem
  Rung sao la nen
  Khoi suong giang loi co quen
`;

const key = "vyse";

// ==========================
// ====Chương trình chính====
// ==========================

console.log("======= HILL CIPHER =======");
console.log("Bảng chữ cái (A = 1):");
console.log("Z A B C D E F G H I J K L");
console.log("M N O P Q R S T U V W X Y");
console.log("===========================");

const hillMatrix = buildMatrixFromKey(key, 2);
console.log(`\nMa trận Hill được tạo từ key "${key}":`);
printMatrix(hillMatrix);

console.log("\nCiphertext mã hóa được:");
const encryptedVector = encryptHill(plaintext, hillMatrix);
const ciphertext = vectorToText(encryptedVector);
console.log(ciphertext);

console.log("\nMa trận khả nghịch Hill dùng cho giải mã:");
printMatrix(inverseMatrixMod26(hillMatrix));

console.log("\nGiải mã ciphertext:");
const decryptedVector = decryptHill(ciphertext, hillMatrix);
const decryptedText = vectorToText(decryptedVector);
console.log(decryptedText);
