/**
 *    Ý TƯỞNG:
 *
 *    Với mỗi ký tự trong ciphertext:
 *      -> Nếu là chữ cái: chuyển thành chỉ số, trừ đi keyIndex, mod 26, rồi đổi lại thành chữ cái.
 *      -> Nếu không phải chữ cái: giữ nguyên.
 *    Kết quả là plaintext đã giải mã.
 */

// =======================
// =====Các hàm xử lý=====
// =======================

// chuyển từ chữ cái sang vị trí trong bảng chữ cái
function charToAlphabet(char) {
  const code = char.charCodeAt(0);

  if (code >= 97 && code <= 122) {
    return { index: code - 97, letterCase: "lower" };
  } else if (code >= 65 && code <= 90) {
    return { index: code - 65, letterCase: "upper" };
  }
}

// chuyển từ vị trí trong bảng chữ cái sang chữ cái tương ứng
function alphabetIndexToChar(index, letterCase) {
  return letterCase === "lower"
    ? String.fromCharCode(index + 97)
    : String.fromCharCode(index + 65);
}

// trả về kết quả modulo cho 26
function mod26(n) {
  return ((n % 26) + 26) % 26;
}

// hàm giải mã
function decrypt(ciphertext, key) {
  // tìm vị trí trong bảng chữ cái của key
  const { index: keyIndex } = charToAlphabet(key);

  let result = "";

  for (const letter of ciphertext) {
    // tìm vị trí trong bảng chữ cái của từng kí tự trong ciphertext
    const letterInAlphabet = charToAlphabet(letter);

    // Giữ nguyên ký tự không phải chữ cái
    if (!letterInAlphabet) {
      result += letter;
      continue;
    }

    // giải mã từng kí tự rồi chuyển lại sang chữ cái
    result += alphabetIndexToChar(
      mod26(letterInAlphabet.index - keyIndex),
      letterInAlphabet.letterCase
    );
  }

  return result;
}

// ============================
// =====Chương trình chính=====
// ============================

const ciphertext = `
Max NBM bl t extwbgz bglmbmnmbhg ngwxk OGN-AVF, lixvbtebsbgz bg max
ybxew hy bgyhkftmbhg mxvaghehzr. Xlmtueblaxw pbma t fbllbhg mh yhlmxk
bgghotmbhg tgw xqvxeexgvx bg BM xwnvtmbhg tgw kxlxtkva, NBM hyyxkl t
pbwx ktgzx hy ngwxkzktwntmx tgw ihlmzktwntmx ikhzktfl tbfxw tm ikhwnvbgz
abzaer ldbeexw ikhyxllbhgtel. Max ngboxklbmr bl kxvhzgbsxw yhk bml
vnmmbgz-xwzx kxlxtkva bg tkxtl ebdx vruxklxvnkbmr, tkmbybvbte
bgmxeebzxgvx, tgw lhymptkx xgzbgxxkbgz. Pbma lmtmx-hy-max-tkm
ytvbebmbxl tgw t lmkhgz xfiatlbl hg vheetuhktmbhg pbma bgwnlmkr, NBM
xjnbil lmnwxgml pbma uhma maxhkxmbvte dghpexwzx tgw iktvmbvte ldbeel mh
makbox bg max ktibwer xoheobgz mxva bgwnlmkr.
`;

// tìm key bằng cách loop qua bảng chữ cái, ta thấy rằng với khóa 't' thì mã được giải có ý nghĩa
// for (let i = 0; i < 26; i++) {
//     const letter = alphabetIndexToChar(i, 'lower');
//     console.log(i + " " + letter + "\n" + decrypt(ciphertext.slice(0, 21), letter));
// }

// gọi hàm decrypt với khóa 't'
console.log(decrypt(ciphertext, "t"));

// --- plaintext thu được:
/* 
    The UIT is a leading institution under VNU-HCM, specializing in the
    field of information technology. Established with a mission to foster
    innovation and excellence in IT education and research, UIT offers a
    wide range of undergraduate and postgraduate programs aimed at producing
    highly skilled professionals. The university is recognized for its
    cutting-edge research in areas like cybersecurity, artificial
    intelligence, and software engineering. With state-of-the-art
    facilities and a strong emphasis on collaboration with industry, UIT
    equips students with both theoretical knowledge and practical skills to
    thrive in the rapidly evolving tech industry.
*/
