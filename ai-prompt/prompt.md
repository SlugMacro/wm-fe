# Prompt Log

## 1. Khởi tạo project

Tao muốn tạo 1 project build 1 app trading trên môi trường react + tailwind. Tạo cho tao đi.

Metric fear & greed + altcoin lấy data thật.

Recent trade giới hạn 10 item, giả lập cứ 1 phút xuất hiện thêm 1 trade mới, tạo animation xuất hiện trade đấy + đổi time của những trade phía dưới theo logic.

---

## 2. Tiếp tục làm việc

Hello. Làm việc tiếp thôi. Đưa link local lại cho tao đi.

---

## 3. Tier icon cho recent trades

Độ lớn lệnh ở recent trade được thể hiện bằng các icon ở component design này:
https://www.figma.com/design/ggDreU6ZixPecNuXXhgoGG/WhalesMarket-v2?node-id=50008-7150&t=Z9ZvCqEXQq7U0x1M-1
Theo logic của ảnh. Hover vào icon sẽ có tooltip giải thích rank lệnh tương ứng với content như ảnh đã đưa.

---

## 4. Live market animation + Ended tab

Ở section này, tao muốn có animation last price thay đổi mỗi 5s -> 30s (tạo sample data giá khớp lệnh - nếu có case không có giá khớp thì giữ nguyên, nếu có giá khớp mới thì thay đổi giá khớp -> thay đổi các vol + % change tương ứng + chart sẽ thay đổi màu theo giá lên hoặc xuống) - animation sẽ đơn giản, chỉ thay đổi số - mày có thể mở claude web browser để check animation ở đây https://www.okx.com/markets/prices.

---

## 5. Tab Ended - data & layout

https://www.figma.com/design/ggDreU6ZixPecNuXXhgoGG/WhalesMarket-v2?node-id=42540-728736&t=Z9ZvCqEXQq7U0x1M-1
Đây là sample data cho tab ended. Ended sẽ ko có mini-chart, chỉ có last price/total vol (không có % change), chỉ có data settled ended (UTC). Sử dụng phân trang (tương tự style phân trang ở dashboard) - mỗi trang sẽ có 6 items. Riêng với tab ended sẽ xuất hiện search và filter theo network - search và filter phải làm việc đc, search ngay trên màn này. Hãy tìm các ảnh sample để thay cho ảnh token, phải theo logic là ended thì ko đc trùng với live + upcoming.

---

## 6. Tab Ended - fix layout

Xử lý việc chuyển sang tab ended bị giật layout. Button filter phải là button neutral - chính xác như link này:
https://www.figma.com/design/ggDreU6ZixPecNuXXhgoGG/WhalesMarket-v2?node-id=42540-728736&t=Z9ZvCqEXQq7U0x1M-1
Input border cho mờ đi 1 chút (sẽ dùng thống nhất cho tất cả input sau này).

Các ảnh token mày lấy ở desktop của tao, cứ đặt random vào.

Không tồn tại TBA ở case ended, tất cả phải có data settled start/ended.

Total vol phải là số lẻ, tương tự như live market.

Last price phải > 0.

Màn này đang sort theo total vol.

---

## 7. Wallet connect & animation notes

Lưu ý từ giờ về sau: Các action dropdown phải có animation transistion mượt.

Đổi icon incentive bằng icon image ở button chứa holding + fee ở header.

Icon hyperlink ở open in explorer phải giống icon ở tx.id (đồng bộ tất cả icon hyperlink mở ra màn khác là icon này).

Sau khi disconnect thì button connect là button như ảnh. Khi bấm connect thì hiện modal như link:
https://www.figma.com/design/ggDreU6ZixPecNuXXhgoGG/WhalesMarket-v2?node-id=37421-192172&t=TFJQN52MfS5JrTdd-1
Chuyển sang tab solana thì sẽ như thế này:
https://www.figma.com/design/ggDreU6ZixPecNuXXhgoGG/WhalesMarket-v2?node-id=39380-377796&t=TFJQN52MfS5JrTdd-1
Bấm vào phantom sẽ quay lại happy case login xong.

Lưu ý từ giờ về sau: Các modal xuất hiện/tắt sẽ phải có transistion mượt, có chung 1 border radius.

---

## 8. Recent trades ở token detail

Recent trades ở token info:

- Không có sort.
- Không có view all.
- Có lẫn lộn collateral giữa stable coin và native coin (tuỳ theo chain của token).
- Cho column side và time rộng ra giống như ở recent trades market page.
- Show 15 items, nhưng khi hover vào khoảng table thì có scroll để xem thêm những trade phía dưới, scroll sẽ phải làm với width 4px, màu chỉ hơi sáng hơn so với background — đây sẽ là chuẩn chung cho scroll nếu có.

Lưu ý từ nay về sau: Tất cả price của order rs (resell) sẽ có màu vàng.

---

## 9. Footer live data + metric

Tao muốn sửa data live data vol 24h ở footer thực tế vào các giao dịch hệ thống. Sau đó metric 24h vol ở home lấy data + chart tương ứng đó thì có đc ko? Nếu nhỏ quá thì metric đó sẽ đổi thành total vol cũng đc, miễn là phải có sự thay đổi data + chart real time.

---

## 10. Token detail - dropdowns & filters

Ok. Quay về token detail:

Dropdown của size:
https://www.figma.com/design/ggDreU6ZixPecNuXXhgoGG/WhalesMarket-v2?node-id=40486-269553&t=N77t1zf8jRSS900g-1

Dropdown của min-fill:
https://www.figma.com/design/ggDreU6ZixPecNuXXhgoGG/WhalesMarket-v2?node-id=40560-42219&t=N77t1zf8jRSS900g-1

Dropdown của collateral:
https://www.figma.com/design/ggDreU6ZixPecNuXXhgoGG/WhalesMarket-v2?node-id=37913-227056&t=N77t1zf8jRSS900g-1

Icon ngoài cùng bên phải là icon on/off chart:
https://www.figma.com/design/ggDreU6ZixPecNuXXhgoGG/WhalesMarket-v2?node-id=40584-21949&t=N77t1zf8jRSS900g-1
Mặc định là đang mở (xanh) - khi bấm vào thì tắt chart và kéo content lên trên - chuyển màu trắng.

Khi có filter của size, min fill và collateral thì sẽ xuất hiện các chip:
https://www.figma.com/design/ggDreU6ZixPecNuXXhgoGG/WhalesMarket-v2?node-id=40584-21953&t=N77t1zf8jRSS900g-1
Và data dưới sẽ được filter.

Khi chuyển tab resell:
https://www.figma.com/design/ggDreU6ZixPecNuXXhgoGG/WhalesMarket-v2?node-id=42378-147393&t=N77t1zf8jRSS900g-1
(Chỉ có resell cho order buy - bỏ min fill và size - vì chỉ có thể fill hết toàn bộ order).

Resell sẽ có tooltip - chỗ icon info - mày tự viết tooltip dựa trên design và ngữ cảnh.

Khi chuyển tab all:
https://www.figma.com/design/ggDreU6ZixPecNuXXhgoGG/WhalesMarket-v2?node-id=40931-167611&t=N77t1zf8jRSS900g-1
Những order nào là resell của buy sẽ có badge rs.

---

## 11. Resell logic update

Update logic cho resell - cập nhật logic của hệ thống.

Resell là fill 1 lần hết cả order ->

Không thể tồn tại xanh background remain.

Không tồn tại case resell có badge full (vì thừa - bản chất resell là full).

---

Sửa lại các column width trong table resell cho cân đối hơn - có thể cho fill width cũng được.

---

## 12. Wallet connect logic fix

Logic vẫn sai.

Ví dụ tao đang connect wallet mạng Solana, tao sang token mạng ethereum mua thì sẽ ko hiển thị balance ở selling - trade panel + tất cả các case order khi active đề phải có cta switch network - bấm vào lại hiện ra modal connect wallet - active vào network của token hiện đang muốn trade.

Nếu tao chưa connect wallet -> tất cả các order bấm vào, trade panel đều ko có balance ở selling (vì chưa connect wallet) -> tất cả cta đều là connect wallet -> bấm vào ra modal connect wallet, đang active ở tab network của token đang muốn trade.

Lưu ý: Ko bao giờ tồn tại case Insufficient Balance ở trong 2 case này.

---

## 13. Font settings

Ê - giờ mày sửa font của hệ thống thành font geist, nhưng những data nào liên quan đến số tiền + amount + price thì là font geist mono thì có phức tạp ko?

---

Về font - tao muốn add thêm font feature-settings như này: `'dlig' on, 'ss01' on, 'ss03' on, 'ss04' on, 'ss05' on, 'ss06' on;`

Được, thêm `font-feature-settings` vào CSS global.

---

## 14. My Order logic

Logic my order:

Trong orderbook sẽ tồn tại một vài order của bản thân mình - sẽ được đánh dấu có icon user bên cạnh price (mày sửa icon khác cho dễ phân biệt hơn) - khi active vào order đó thì thay vì trade, chỗ trade panel sẽ hiển thị close order đây.

Link design:

Buy order:
https://www.figma.com/design/ggDreU6ZixPecNuXXhgoGG/WhalesMarket-v2?node-id=37228-78683&t=N77t1zf8jRSS900g-1

-> khi bấm vào sẽ hiện modal confirm:
https://www.figma.com/design/ggDreU6ZixPecNuXXhgoGG/WhalesMarket-v2?node-id=37726-195460&t=N77t1zf8jRSS900g-1

Sell order:
https://www.figma.com/design/ggDreU6ZixPecNuXXhgoGG/WhalesMarket-v2?node-id=37788-367004&t=N77t1zf8jRSS900g-1

-> khi bấm vào sẽ hiện modal confirm:
https://www.figma.com/design/ggDreU6ZixPecNuXXhgoGG/WhalesMarket-v2?node-id=37789-503381&t=N77t1zf8jRSS900g-1
