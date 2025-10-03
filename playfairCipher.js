/**
 * Ý tưởng:
 *
 * - Dùng khóa (key) để tạo ma trận 5x5 chứa 25 chữ cái (J gộp với I).
 * - Chia plaintext thành từng cặp ký tự:
 *    + Nếu 2 ký tự cùng hàng -> thay mỗi ký tự bằng ký tự bên phải.
 *    + Nếu 2 ký tự cùng cột -> thay mỗi ký tự bằng ký tự bên dưới.
 *    + Nếu khác hàng, khác cột -> hoán đổi vị trí tạo thành hình chữ nhật.
 * - Khi giải mã thì ngược lại:
 *    + Cùng hàng -> dịch trái.
 *    + Cùng cột -> dịch lên.
 *    + Khác hàng, khác cột -> hoán đổi như trên.
 * - Xử lý đặc biệt:
 *    + J thay bằng I.
 *    + Nếu 2 ký tự liền nhau trùng nhau -> chèn 'X' vào giữa.
 *    + Nếu độ dài lẻ -> thêm 'X' cuối chuỗi.
 */

// ========================
// =====Các hàm hỗ trợ=====
// ========================
function buildMatrixFromArray(array) {
  if (array.length !== 25) {
    return null; // Ma trận Playfair luôn 5x5 = 25 ký tự, nếu khác thì sai
  }

  const matrix = [];
  for (let i = 0; i < 25; i += 5) {
    // Cắt mảng thành từng hàng 5 ký tự
    matrix.push(array.slice(i, i + 5));
  }
  return matrix;
}

function createPlayfairMatrix(key = "") {
  const elements = Array.from(
    new Set([
      // 1. Loại bỏ khoảng trắng, thay j = i, viết hoa
      ...key.replace(/\s+/g, "").replace(/j/g, "i").toUpperCase(),
      // 2. Thêm toàn bộ bảng chữ cái (trừ J)
      "A", "B", "C", "D", "E",
      "F", "G", "H", "I", "K",
      "L", "M", "N", "O", "P",
      "Q", "R", "S", "T", "U",
      "V", "W", "X", "Y", "Z"
    ])
  ); // prettier-ignore
  // new Set() loại bỏ ký tự trùng lặp, đảm bảo chỉ còn 25 ký tự duy nhất

  const matrix = buildMatrixFromArray(elements);
  const positionMap = new Map();

  // Tạo map lưu vị trí (row, col) của từng ký tự trong ma trận
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 5; col++) {
      positionMap.set(matrix[row][col], [row, col]);
    }
  }

  return { matrix, positionMap }; // Trả về cả ma trận và bản đồ vị trí
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

function shiftLeftIndex(index) {
  // Nếu ở cột 0 -> quay về cột 4 (dịch vòng sang trái)
  return index === 0 ? 4 : index - 1;
}

function shiftRightIndex(index) {
  // Nếu ở cột 4 -> quay về cột 0 (dịch vòng sang phải)
  return index === 4 ? 0 : index + 1;
}

function normalize(text) {
  let normalized = text
    .replace(/\s+/g, "") // Xóa khoảng trắng
    .toUpperCase() // Đưa hết về chữ hoa
    .replace(/J/g, "I") // Thay J bằng I
    .replace(/([A-Z])\1/g, "$1X$1"); // Nếu có 2 ký tự trùng nhau liền kề -> chèn "X" vào giữa

  // Nếu độ dài lẻ -> thêm X vào cuối để thành cặp
  return normalized.length % 2 === 1 ? normalized + "X" : normalized;
}

// ===============================
// ======Hàm encrypt/decrypt======
// ===============================
function encryptPlayfair(text, key) {
  let normalized = normalize(text); // Chuẩn hóa văn bản đầu vào
  const { matrix, positionMap } = createPlayfairMatrix(key);

  let encrypted = "";
  for (let i = 0; i < normalized.length; i += 2) {
    const first = normalized[i];
    const second = normalized[i + 1];
    const [firstRow, firstCol] = positionMap.get(first);
    const [secondRow, secondCol] = positionMap.get(second);

    if (firstRow === secondRow) {
      // Cùng hàng -> dịch phải
      encrypted += matrix[firstRow][shiftRightIndex(firstCol)];
      encrypted += matrix[secondRow][shiftRightIndex(secondCol)];
    } else if (firstCol === secondCol) {
      // Cùng cột -> dịch xuống
      encrypted += matrix[shiftRightIndex(firstRow)][firstCol];
      encrypted += matrix[shiftRightIndex(secondRow)][secondCol];
    } else {
      // Khác hàng, khác cột -> hoán đổi tạo hình chữ nhật
      encrypted += matrix[firstRow][secondCol];
      encrypted += matrix[secondRow][firstCol];
    }
    encrypted += " "; // Thêm khoảng trắng để dễ đọc
  }

  return encrypted;
}

function decryptPlayfair(ciphertext, key) {
  const cleanCiphertext = ciphertext.replace(/\s+/g, ""); // Xóa khoảng trắng
  const { matrix, positionMap } = createPlayfairMatrix(key);

  let decrypted = "";
  for (let i = 0; i < cleanCiphertext.length; i += 2) {
    const first = cleanCiphertext[i];
    const second = cleanCiphertext[i + 1];
    const [firstRow, firstCol] = positionMap.get(first);
    const [secondRow, secondCol] = positionMap.get(second);

    if (firstRow === secondRow) {
      // Cùng hàng -> dịch trái
      decrypted += matrix[firstRow][shiftLeftIndex(firstCol)];
      decrypted += matrix[secondRow][shiftLeftIndex(secondCol)];
    } else if (firstCol === secondCol) {
      // Cùng cột -> dịch lên
      decrypted += matrix[shiftLeftIndex(firstRow)][firstCol];
      decrypted += matrix[shiftLeftIndex(secondRow)][secondCol];
    } else {
      // Khác hàng, khác cột
      decrypted += matrix[firstRow][secondCol];
      decrypted += matrix[secondRow][firstCol];
    }
    decrypted += " "; // Thêm khoảng trắng cho dễ đọc
  }

  return decrypted;
}

// ==================
// ====== DATA ======
// ==================
const text = `
  day la chuong trinh playfair cipher 
  toi da code no toi rat yeu thich thanh qua lao dong nay 
  toi se cho cac ban cua minh xem chuong trinh nay
`;

const key = "harry potter";

// ============================
// =====Chương trình chính=====
// ============================
console.log(`Độ dài của text ban đầu: ${text.replace(/\s+/g, "").length}`);

console.log(`Key: ${key}`);

console.log("Ma trận PlayFair:");
const { matrix } = createPlayfairMatrix(key);
printMatrix(matrix);

const ciphertext = encryptPlayfair(text, key);
console.log("\nCiphertext:");
console.log(ciphertext);

console.log("\nGiải mã lại:");
console.log(decryptPlayfair(ciphertext, key));
