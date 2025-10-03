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
const ciphertext = `
67* 7-881 0+66*8 %*8$*%, &8$66*= _1 _8$6$%7 -567+8 #.@. 8+&!$=^, $% +=* +3 67* ~+%6 0+05!-8 -=( $=3!5*=6$-! 3-=6-%1 %-^-% +3 ~+(*8= !$6*8-658*. %0-==$=^ %*4*= _++@%, 67* %*8$*% 3+!!+&% 67* !$3* +3 - 1+5=^ _+1, 7-881 0+66*8, &7+ ($%)+4*8% += 7$% \`\`67 _$867(-1 67-6 7* $% - &$2-8(. 7* $% $=4$6*( 6+ -66*=( 7+^&-86% %)7++! +3 &$6)7)8-36 -=( &$2-8(81, &7*8* 7* !*-8=% -_+56 7$% ~-^$)-! 7*8$6-^*, (*4*!+0% )!+%* 38$*=(%7$0%, -=( )+=38+=6% 67* (-8@ 3+8)*% 67-6 678*-6*= 67* &$2-8($=^ &+8!(.

67* )*=68-! 0!+6 8*4+!4*% -8+5=( 7-881'% +=^+$=^ _-66!* &$67 !+8( 4+!(*~+86, - (-8@ &$2-8( $=6*=6 += )+=95*8$=^ _+67 67* ~-^$)-! -=( =+=)~-^$)-! &+8!(%. -% 7-881 ^8+&% +!(*8, 7* !*-8=% ~+8* -_+56 7$% +&= ~1%6*8$+5% 0-%6, 7$% )+==*)6$+= 6+ 4+!(*~+86, -=( 67* 08+07*)1 67-6 6$*% 67*$8 3-6*% 6+^*67*8. 678+5^7+56 67* %*8$*%, 67*~*% +3 38$*=(%7$0, !+1-!61, _8-4*81, -=( 67* 0+&*8 +3 !+4* -8* *90!+8*(, &$67 - 8$)7 &+8!( 3$!!*( &$67 ~-^$)-! )8*-658*%, %0*!!%, -=( (**0 ~167+!+^1.

67* _++@%, %6-86$=^ &$67 7-881 0+66*8 -=( 67* 07$!+%+07*8'% %6+=* %\`886^ -=( )+=)!5($=^ &$67 $7-881 0+66*8 -=( 67* (*-67!1 7-!!+&% %1996^, 7-4* %+!( +4*8 499 ~$!!$+= )+0$*% &+8!(&$(*, _**= 68-=%!-6*( $=6+ ~+8* 67-= 79 !-=^5-^*%, -=( -(-06*( $=6+ - %5))*%%35! 3$!~ %*8$*%. 67* %*8$*% $% @=+&= =+6 +=!1 3+8 $6% *=)7-=6$=^ &+8!()_5$!($=^ _56 -!%+ 3+8 -((8*%%$=^ (-8@*8, )+~0!*9 67*~*% %5)7 -% ~+86-!$61, 08*#5($)*, -=( 67* -_5%* +3 0+&*8. 67* 7-881 0+66*8 %*8$*% 7-% !*36 -= $=(*!$_!* ~-8@ += 0+05!-8 )5!658*, 3+%6*8$=^ - ^!+_-! 3-= _-%*, $=%0$8$=^ )+5=6!*%% %0$=)+33%, -=( )*~*=6$=^ $6% 0!-)* -% - !$6*8-81 07*=+~*=+=.
`;

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
