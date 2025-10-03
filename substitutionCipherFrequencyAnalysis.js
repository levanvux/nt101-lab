/**
 *    Ý TƯỞNG:
 *
 *    - Đếm tần suất xuất hiện các ký tự trong ciphertext để tìm ra bảng ký tự theo độ phổ biến.
 *    - Dùng tần suất chữ cái tiếng Anh làm tham chiếu, xây dựng mapping giữa ciphertext và plaintext.
 *    - Với mỗi ký tự trong ciphertext:
 *        -> Nếu có trong mapping: thay bằng chữ cái dự đoán.
 *        -> Nếu không có: giữ nguyên.
 *    - Kết quả là plaintext gần đúng, sau đó tinh chỉnh mapping dựa trên các từ có nghĩa (ví dụ "the", "is", "and"...).
 */

// ===========================
// =======Các hàm xử lý=======
// ===========================
function getCharactersByFrequency(text) {
  const frequency = {};

  // Bỏ dấu phẩy, dấu chấm, khoảng trắng và xuống dòng
  const workingText = text.toLowerCase().replace(/[., \n\r]/g, "");
  for (const char of workingText) {
    frequency[char] = (frequency[char] || 0) + 1;
  }

  // sắp xếp tần suất xuất hiện theo thứ tự giảm dần
  const sortedFrequency = Object.entries(frequency).sort((a, b) => b[1] - a[1]);

  // chỉ trả về character
  return sortedFrequency.map((f) => f[0]);
}

function createMapping(listA, listB) {
  const mapping = {};
  for (let i = 0; i < listA.length; i++) {
    mapping[listA[i]] = listB[i];
  }
  return mapping;
}

function decryptSubstitution(ciphertext, substitutionLetters) {
  const cipherCharactersByFrequency = getCharactersByFrequency(ciphertext);

  // tạo bảng Mapping: mỗi số hoặc ký tự trong ciphertext tương ứng với chữ cái suy đoán
  const mapping = createMapping(
    cipherCharactersByFrequency,
    substitutionLetters
  );

  let decrypted = "";
  for (const char of ciphertext) {
    if (mapping[char]) {
      decrypted += mapping[char];
    } else {
      decrypted += char; // giữ nguyên các ký tự còn lại
    }
  }

  return decrypted;
}

// ==========================
// ========== Data ==========
// ==========================
const fs = require("fs"); // module xử lý file
const ciphertext = fs.readFileSync("3_2_cipher_text.txt", { encoding: "utf8" });

// thứ tự tần suất chữ cái trong tiếng Anh (dùng để tham khảo)
// vì ciphertext có 27 ký tự, còn tiếng Anh chỉ 26 chữ cái, nên ta thêm "1" vào bảng ánh xạ
const englishLettersByFrequency = [
  "e","t","a","o","i","n","s","r","h","l",
  "d","u","c","m","f","y","w","g","p","b",
  "v","x","k","q","z","j", "1"
]; // prettier-ignore

/* 
    XÂY DỰNG MAPPING DỰA TRÊN THỨ TỰ TẦN SUẤT CHỮ CÁI TIẾNG ANH VÀ SUY ĐOÁN

    cụm "67*" lặp lại nhiều lần nhất => đó có thể là từ "the" => thay "6" bằng "t", "7" bằng "h", * bằng "e"
    thay "$" bằng "i", "%" bằng "s" thì từ "is" xuất hiện nhiều lần
    thấy "-" đứng một mình nhiều lần => đó có thể là từ "a" => thay "-" bằng "a"
    thay "8" bằng "r" thì từ "series" xuất hiện nhiều lần
    thay "(" bằng "d" thì từ "and" xuất hiện nhiều lần 
    thay "3" bằng "f" thì từ "of" xuất hiện nhiều lần 
    thay "1" bằng "y" thì các từ có nghĩa như "fantasy", "birthday" xuất hiện 
    thay "~" bằng "m" thì các từ có nghĩa như "modern", "more" xuất hiện 
    thay "&" bằng "w" thì các từ có nghĩa như "follows", "world" xuất hiện 
    thay "2" bằng "z" thì từ "wizard" xuất hiện nhiều lần
    thay "5" bằng "u" thì các từ có nghĩa như "author", "about" xuất hiện
    thay ")" bằng "c" thì các từ có nghĩa như "discovers", "close" xuất hiện
    thay "0" bằng "p" thì các từ có nghĩa như "develops", "friendships" xuất hiện
    thấy cụm "on his ``th birthday" => ta đoán "``" này chính là một số => thay "`" bằng "1"

    đến đây thì nội dung của đoạn mã đã được giải gần hết, ta thấy nhiều chỗ xuất hiện từ hợp lý như "harry's", "philosopher's" nên không cần thay dấu ' nữa
*/
const substitutionLetters = [
  "e","t","o","r","a","s","n","i","h","l",
  "d","c","p","g","w","f","u","y","m","b",
  "v","x","k","z","1","j", "'"
]; // prettier-ignore

// ================================
// =======Chương trình chính=======
// ================================
const decrypted = decryptSubstitution(ciphertext, substitutionLetters);
console.log("Đoạn văn bản giải được:\n");
console.log(decrypted);
