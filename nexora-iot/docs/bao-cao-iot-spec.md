# Bao cao IoT — extracted text (auto-generated from Báo cáo IOT.docx)

centercenter00HỌC VIỆN CÔNG NGHỆ BƯU CHÍNH VIỄN THÔNG
center27442000KHOA CÔNG NGHỆ THÔNG TIN 1
BÁO CÁO HỌC PHẦN
ĐỀ TÀI: Xây dựng hệ thống IoT Dashboard
giám sát và điều khiển thiết bị
Học phần:  IoT và Ứng dụng
Giảng viên hướng dẫn:  Thầy Nguyễn Quốc Uy
Sinh viên thực hiện	:  Trần Khắc Long
Mã sinh viên	:  B23DCCN511
Hà Nội – 2026
MỤC LỤC
TOC \o "1-3" \h \z \u CHƯƠNG I: GIỚI THIỆU ĐỀ TÀI	 PAGEREF _Toc238056395 \h 6
1.Giới thiệu chung	 PAGEREF _Toc238056396 \h 6
2.Mục tiêu nghiên cứu	 PAGEREF _Toc238056397 \h 6
3.Phạm vi và đối tượng nghiên cứu	 PAGEREF _Toc238056398 \h 6
CHƯƠNG II: THIẾT KẾ HỆ THỐNG	 PAGEREF _Toc238056399 \h 8
2.1 Tổng quan về kiến trúc hệ thống	 PAGEREF _Toc238056400 \h 8
CHƯƠNG 3: THIẾT KẾ CHI TIẾT	 PAGEREF _Toc238056401 \h 10
3.1 Use Case tổng quan	 PAGEREF _Toc238056402 \h 10
3.2. UC01: Đăng nhập	 PAGEREF _Toc238056403 \h 11
API-01: Đăng nhập hệ thống	 PAGEREF _Toc238056404 \h 11
API-02: Lấy thông tin người dùng	 PAGEREF _Toc238056405 \h 12
2.3. UC02: Xem dashboard cảm biến	 PAGEREF _Toc238056406 \h 13
Sequence	 PAGEREF _Toc238056407 \h 15
API-03: Lấy dữ liệu cảm biến	 PAGEREF _Toc238056408 \h 16
2.4. UC03: Bật/Tắt thiết bị	 PAGEREF _Toc238056409 \h 17
Sequence	 PAGEREF _Toc238056410 \h 19
E1.	 PAGEREF _Toc238056411 \h 19
API-06: Lấy ra danh sách các thiết bị	 PAGEREF _Toc238056412 \h 20
API-07: Điều khiển bật/tắt thiết bị	 PAGEREF _Toc238056413 \h 21
2.5. UC04: Xem lịch sử cảm biến	 PAGEREF _Toc238056414 \h 22
Sequence	 PAGEREF _Toc238056415 \h 24
API-04: Lấy danh sách các cảm biến	 PAGEREF _Toc238056416 \h 24
API-05: Lấy lịch sử cảm biến	 PAGEREF _Toc238056417 \h 25
2.6. UC05: Xem lịch sử bật/tắt	 PAGEREF _Toc238056418 \h 26
Sequence	 PAGEREF _Toc238056419 \h 27
API-06: Lấy ra danh sách các thiết bị	 PAGEREF _Toc238056420 \h 28
API-08: Lấy lịch sử điều khiển thiết bị	 PAGEREF _Toc238056421 \h 29
CHƯƠNG III: FE	 PAGEREF _Toc238056422 \h 31
3.1 Đăng nhập	 PAGEREF _Toc238056423 \h 31
3.2 Dashboard(tổng quan cảm biến)	 PAGEREF _Toc238056424 \h 32
3.3 Trang bật/tắt thiết bị	 PAGEREF _Toc238056425 \h 33
3.4 Trang lịch sử cảm biến	 PAGEREF _Toc238056426 \h 34
3.5 Trang lịch sử điều khiển thiết bị	 PAGEREF _Toc238056427 \h 34
CHƯƠNG IV: DATABASE	 PAGEREF _Toc238056428 \h 37
4.1. Tổng quan	 PAGEREF _Toc238056429 \h 37
2.2. Chi tiết các bảng	 PAGEREF _Toc238056430 \h 37
Bảng users – Thông tin người dùng	 PAGEREF _Toc238056431 \h 37
Bảng sensors – Danh mục cảm biến	 PAGEREF _Toc238056432 \h 38
Bảng devicess – Danh mục thiết bị	 PAGEREF _Toc238056433 \h 38
Bảng data_sensorss – Dữ liệu đo cảm biến	 PAGEREF _Toc238056434 \h 39
Bảng action – Lịch sử hành động bật/tắt	 PAGEREF _Toc238056435 \h 39
CHƯƠNG V. API DOCUMENTATION	 PAGEREF _Toc238056436 \h 39
5.1. Danh sách API	 PAGEREF _Toc238056437 \h 39
4.2. API Authentication	 PAGEREF _Toc238056438 \h 40
API-01: Đăng nhập hệ thống	 PAGEREF _Toc238056439 \h 40
API-02: Lấy thông tin người dùng	 PAGEREF _Toc238056440 \h 41
4.3. API Sensors	 PAGEREF _Toc238056441 \h 42
API-03: Lấy dữ liệu cảm biến	 PAGEREF _Toc238056442 \h 42
API-04: Lấy danh sách các cảm biến	 PAGEREF _Toc238056443 \h 43
API-05: Lấy lịch sử cảm biến	 PAGEREF _Toc238056444 \h 44
4.4. API Devices	 PAGEREF _Toc238056445 \h 45
API-06: Lấy ra danh sách các thiết bị	 PAGEREF _Toc238056446 \h 45
API-07: Điều khiển bật/tắt thiết bị	 PAGEREF _Toc238056447 \h 46
API-08: Lấy lịch sử điều khiển thiết bị	 PAGEREF _Toc238056448 \h 47
MỤC LỤC ẢNH
TOC \h \z \t "Picture,1" Hình 1: Sơ đồ Use Case tổng quan	 PAGEREF _Toc237982103 \h 4
Hình 2: Giao diện đăng nhập	 PAGEREF _Toc237982104 \h 5
Hình 3: Dashboard	 PAGEREF _Toc237982105 \h 6
Hình 4: Giao diện điều khiển bật/tắt thiết bị	 PAGEREF _Toc237982106 \h 7
Hình 5: Giao diện lịch sử cảm biến	 PAGEREF _Toc237982107 \h 8
Hình 6: Giao diện lịch sử bật/tắt thiết bị	 PAGEREF _Toc237982108 \h 9
Hình 7: ERD	 PAGEREF _Toc237982109 \h 10
Hình 8: Sequence Diagram: Đăng nhập	 PAGEREF _Toc237982110 \h 13
Hình 9: Sequence Diagram Lấy/Hiển thị dữ liệu cảm biến	 PAGEREF _Toc237982111 \h 16
Hình 10: Sequence Diagram: Điều khiển thiết bị	 PAGEREF _Toc237982112 \h 20
CHƯƠNG I: GIỚI THIỆU ĐỀ TÀI
1.Giới thiệu chung
Trong thời đại chuyển đổi số và công nghệ 4.0, các hệ thống thông minh ngày càng đóng vai trò quan trọng trong việc giúp con người giám sát, điều khiển và tự động hóa các thiết bị trong đời sống hằng ngày. Internet of Things (IoT) – Internet vạn vật – là nền tảng cốt lõi cho xu hướng này, cho phép các thiết bị vật lý có thể kết nối với nhau và trao đổi dữ liệu qua Internet, từ đó tạo nên các mô hình “ngôi nhà thông minh”, “thành phố thông minh” hay “nông nghiệp thông minh”.
Xuất phát từ nhu cầu thực tế đó, đề tài “Hệ thống IoT Dashboard giám sát và điều khiển thiết bị” được xây dựng với mục đích tạo ra một mô hình trực quan, giúp người dùng có thể:
Giám sát các thông số môi trường như nhiệt độ, độ ẩm, ánh sáng theo thời gian thực.
Điều khiển các thiết bị điện trong mô hình (đèn, quạt, điều hòa mô phỏng) chỉ với vài thao tác đơn giản trên giao diện web.
Theo dõi lịch sử hoạt động của cảm biến và thiết bị để đánh giá tình trạng môi trường.
Sản phẩm được thiết kế như một mô hình thu nhỏ của hệ thống nhà thông minh (Smart Home), trong đó người dùng có thể chủ động tương tác, quan sát và điều khiển thiết bị từ xa.
Hệ thống hướng đến việc mang lại tính tiện lợi, an toàn và hiện đại trong sinh hoạt, đồng thời có thể mở rộng để ứng dụng trong nhiều lĩnh vực khác nhau như quản lý tòa nhà, phòng học, nhà kính hoặc nhà xưởng.
2.Mục tiêu nghiên cứu
Xây dựng một hệ thống IoT hoàn chỉnh cho phép thu thập, hiển thị và điều khiển các thông số môi trường theo thời gian thực.
Tạo giao diện Dashboard trực quan giúp người dùng dễ dàng theo dõi dữ liệu và thao tác điều khiển thiết bị.
Lưu trữ toàn bộ dữ liệu cảm biến và lịch sử bật/tắt thiết bị, phục vụ cho việc phân tích, đánh giá hoặc thống kê sau này.
Đảm bảo hệ thống hoạt động ổn định, phản hồi nhanh và chính xác, ngay cả khi kết nối mạng bị gián đoạn tạm thời.
3.Phạm vi và đối tượng nghiên cứu
Đối tượng nghiên cứu: Hệ thống IoT giám sát môi trường và điều khiển thiết bị trong mô hình nhà thông minh.
Phạm vi thực hiện:
Hệ thống thu thập dữ liệu từ các cảm biến:
DHT11: đo nhiệt độ và độ ẩm.
quang trở cds 5mm 5537: đo cường độ ánh sáng.
Các thiết bị được điều khiển gồm: Quạt, đèn, và điều hòa mô phỏng bằng LED.
Dữ liệu hiển thị qua giao diện Dashboard web, được cập nhật theo thời gian thực.
4. Ý nghĩa thực tiễn
Đề tài có ý nghĩa thiết thực cả về mặt học thuật lẫn ứng dụng thực tế:
Về mặt ứng dụng:
Hệ thống giúp người dùng giám sát điều kiện môi trường và điều khiển thiết bị một cách chủ động, giảm lãng phí năng lượng và tăng tính tiện lợi trong sinh hoạt.
Mô hình có thể được mở rộng để áp dụng trong nhà thông minh, quản lý lớp học, hoặc giám sát môi trường nông nghiệp.
Về mặt thực tiễn xã hội:
Đề tài góp phần nâng cao nhận thức về ứng dụng IoT trong đời sống, khuyến khích việc kết hợp giữa thiết bị vật lý và nền tảng trực tuyến nhằm hướng tới cuộc sống hiện đại, tự động và hiệu quả hơn.
CHƯƠNG II: THIẾT KẾ HỆ THỐNG
2.1 Tổng quan về kiến trúc hệ thống
46297853909060
Database
(MySQL)
Database
(MySQL)
4547524159154
Người
dùng
Người
dùng
505904523344900
29580031254471
MQTT00
MQTT223156214169744692015268605
Frontend
(react)
Frontend
(react)519383880194745019771250488
Backend
(Java spring boot)0
Backend
(Java spring boot)5147541190881000-3245421907655
Hardware00
Hardware7830122271049
topic00
topic101190116723581451783340071419884744078952
LED
LED949556339725022302352860502
DHT11
DHT11145062931755773307204063654
CDS 5537
CDS 55373359152864427
ESP32
ESP32-325062190788604577191138959
Mosquitto
MQTT Broker0
Mosquitto
MQTT Broker
Hình  SEQ Hình \* ARABIC 1: Tổng quan hệ thống
Kiến trúc hệ thống Smart IoT trong project được tổ chức theo mô hình gồm 5 thành phần chính: Client – Server – Database – MQTT – Hardware.
Tại tầng Hardware, ESP32kết nối với cảm biến DHT11 và CDS 5537 để thu thập các thông số môi trường gồm nhiệt độ, độ ẩm và ánh sáng. ESP32đồng thời nhận các lệnh điều khiển từ hệ thống để thực hiện bật/tắt quạt và đèn.
Dữ liệu giữa phần cứng và máy chủ được truyền thông qua MQTT Broker. MQTT hoạt động theo cơ chế Publish/Subscribe, giúp ESP32và Backend không cần giao tiếp trực tiếp với nhau. ESP32gửi dữ liệu cảm biến lên các topic tương ứng, trong khi Backend đăng ký nhận dữ liệu và gửi các lệnh điều khiển thiết bị thông qua MQTT Broker.
Backend Server được xây dựng bằng Spring Boot, đóng vai trò xử lý trung tâm của hệ thống. Backend tiếp nhận dữ liệu từ MQTT Broker, xử lý dữ liệu cảm biến, lưu trữ vào cơ sở dữ liệu và cung cấp các chức năng cho phía Frontend thông qua REST API. Đối với các dữ liệu cần cập nhật tức thời như giá trị cảm biến và trạng thái thiết bị, Backend sử dụng WebSocket để đẩy dữ liệu mới đến giao diện mà không cần người dùng tải lại trang.
Database sử dụng MySQL để lưu trữ các thông tin cần thiết của hệ thống như dữ liệu cảm biến, thông tin thiết bị, lịch sử bật/tắt và thông tin người dùng. Backend là thành phần duy nhất trực tiếp truy xuất và cập nhật dữ liệu trong cơ sở dữ liệu.
Frontend được xây dựng bằng ReactJS, cung cấp giao diện cho người dùng theo dõi dữ liệu và điều khiển thiết bị. Frontend giao tiếp với Backend thông qua REST API để lấy dữ liệu lịch sử, tìm kiếm, lọc và thông qua WebSocket để nhận dữ liệu thời gian thực.
Luồng giám sát dữ liệu đi theo hướng cảm biến → ESP32→ MQTT Broker → Spring Boot → Database/Frontend.
Luồng điều khiển đi theo hướng người dùng → ReactJS → Spring Boot → MQTT Broker → ESP32→ quạt/đèn.
CHƯƠNG 3: THIẾT KẾ CHI TIẾT
3.1 Use Case tổng quan
Hình  SEQ Hình \* ARABIC 2: Sơ đồ Use Case tổng quan
Actor
Actor
Mô tả
User
Người dùng tham gia vào hệ thống quản lý IOT
Danh sách Use Case
ID
Tên Use Case
Mô tả
UC01
Đăng nhập
User đăng nhập vào hệ thống bằng tài khoản có sẵn
UC02
Xem biểu đồ cảm biến
User xem các thông tin về chỉ số và biểu đồ của cảm biến ở màn hình tổng quan
UC03
Bật/Tắt thiết bị
User có thể bật tắt các thiết bị led ở
UC04
Xem lịch sử cảm biến
User xem, tìm kiếm và lọc dữ liệu cảm biến đã ghi lại
UC05
Xem lịch sử bật/tắt
User xem, lọc lịch sử các hành động bật/tắt thiết bị cùng với các thông tin khác như trạng thái, thời gian, kết quả.
3.2. UC01: Đăng nhập
Thuộc tính
Nội dung
ID
UC01
Tên Use Case
Đăng nhập
Actor
User
Mục đích
Xác thực User và cấp quyền truy cập hệ thống
Mô tả
User cung cấp thông tin đăng nhập. Hệ thống kiểm tra thông tin và cấp quyền truy cập nếu hợp lệ.
Hình  SEQ Hình \* ARABIC 3:Giao diện đăng nhập
API-01: Đăng nhập hệ thống
Thuộc tính
Nội dung
API ID
API-01
Method
POST
Endpoint
/api/v1/auth/login
Description
Xác thực người dùng bằng username và password. Trả về token nếu hợp lệ.
Authentication
Không yêu cầu (public endpoint)
Request Body:
{
"username": "string",
"password": "string"
}
Response Body (200 OK):
{
"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
"user": {
"id": 1,
"username": "admin",
"name": "Trần Khắc Long"
}
}
HTTP Status:
Code
Ý nghĩa
200
Đăng nhập thành công
400
Thiếu trường bắt buộc
401
Sai username hoặc password
500
Lỗi server
Error Response:
{
"error": "Sai tên đăng nhập hoặc mật khẩu"
}
API-02: Lấy thông tin người dùng
Thuộc tính
Nội dung
API ID
API-02
Method
GET
Endpoint
/api/v1/auth/me
Description
Lấy thông tin User đang đăng nhập
Authentication
Yêu cầu - Bearer Token
Request Header:
Authorization: Bearer <token>
Response Body (200 OK):
{
"id": 1,
"username": "LongLong",
"name": "Trần Khắc Long",
"description": "Mô tả hồ sơ cá nhân",
"student_id": "B23DCCN511",
"email": "tklongb23dccn511@gmail.com",
"avatar_url": "https://example.com/avatar.jpg",
"figma_url": "https://figma.com/file/...",
"postman_url": "https://postman.com/workspace/...",
"created_at": "2026-08-19 14:00:00"
}
Code
Ý nghĩa
200
Đăng nhập thành công
400
Thiếu trường bắt buộc
401
Sai username hoặc password
500
Lỗi server
API-03: Đăng xuất
Thuộc tính
Nội dung
API ID
API-03
Method
POST
Endpoint
/api/v1/auth/logout
Mô tả
Đăng xuất người dùng. FE xóa token khỏi storage. (Đề xuất thiết kế: BE có thể thêm token vào blacklist nếu cần)
Auth
Có — Bearer Token
Use Case
UC01
DB
Không
MQTT
Không
Request Header:
Authorization: Bearer <token>
Response Body (200 OK):
{
"success": true,
"message": "Đăng xuất thành công"
}
HTTP Status:
Code
Ý nghĩa
200
Đăng xuất thành công
401
Token không hợp lệ/hết hạn
2.3. UC02: Xem dashboard cảm biến
Thuộc tính
Nội dung
ID
UC2
Tên Use Case
Xem dashboard cảm biến
Actor
User
Mục đích
User xem các thông tin về chỉ số và biểu đồ của cảm biến ở màn hình tổng quan
Mô tả
Sau khi đăng nhập, User vào Dashboard và xem biểu đồ hiển thị 3 chỉ số cảm biến theo thời gian.
Mục đích
Cho phép người dùng theo dõi các thông số môi trường hiện tại trong phòng.
Tiền điều kiện
Hệ thống đang hoạt động và cảm biến đã kết nối với hệ thống.
Dữ liệu hiển thị
Nhiệt độ, độ ẩm và cường độ ánh sáng.
Kết quả
Người dùng xem được dữ liệu cảm biến mới nhất trên Dashboard.
Hình  SEQ Hình \* ARABIC 4:Màn tổng quan cảm biến
Hình 3: Dashboard
Sequence
Hình  SEQ Hình \* ARABIC 5: Sequence xem cảm biến
Luồng thực hiện
Người dùng mở màn hình Dashboard.
Giao diện Dashboard gửi yêu cầu lấy dữ liệu cảm biến mới nhất đến Backend thông qua API  GET /api/v1/sensors/data.
Backend truy vấn cơ sở dữ liệu để lấy bản ghi mới nhất của nhiệt độ, độ ẩm và ánh sáng.
Cơ sở dữ liệu trả các giá trị cảm biến; Backend chuyển dữ liệu về giao diện Dashboard.
Sau khi nhận dữ liệu cảm biến mới nhất, giao diện gửi yêu cầu lấy dữ liệu lịch sử để hiển thị biểu đồ
Backend truy vấn lịch sử cảm biến trong cơ sở dữ liệu và trả dữ liệu biểu đồ về giao diện.
Dashboard hiển thị các card nhiệt độ, độ ẩm, ánh sáng và biểu đồ. Sau lần hiển thị đầu tiên, cứ mỗi 2 giây và trong khi Dashboard còn được mở, giao diện tiếp tục lấy dữ liệu cảm biến mới nhất để cập nhật các card mà không cần tải lại trang.
Luồng ngoại lệ:
E1. Không lấy được dữ liệu cảm biến → Sau 30s hệ thống thông báo lỗi và giữ nguyên dữ liệu đang hiển thị.E2. Không lấy được trạng thái thiết bị → Sau 30s hệ thống thông báo lỗi và giữ trạng thái LED gần nhất.
API-04: Lấy dữ liệu cảm biến
Thuộc tính
Nội dung
API ID
API-04
Method
GET
Endpoint
/api/v1/sensors/data
Description
Lấy dữ liệu cảm biến mới nhất để hiển thị biểu đồ trên Dashboard
Authentication
Yêu cầu – Bearer Token trong header
UseCase
UC02
Request Parameters:
Tham số
Loại
Bắt buộc
Mô tả
limit
Query
Không
Số lượng bản ghi trả về (mặc định: 50)
Request Header:
Authorization: Bearer <token>
Response Body (200 OK):
[
{
"sensors_id": 1,
"sensors_name": "Nhiệt độ",
"value": 35.5,
"time": "2026-03-15 12:30:00"
},
{
"sensors_id": 2,
"sensors_name": "Độ ẩm",
"value": 80.0,
"time": "2026-03-15 12:30:00"
},
{
"sensors_id": 3,
"sensors_name": "Ánh sáng",
"value": 1200.0,
"time": "2026-03-15 12:30:00"
}
]
HTTP Status:
Code
Ý nghĩa
200
Thành công
401
Chưa xác thực
500
Lỗi server
API-05: Lấy dữ liệu biểu đồ
Thuộc tính
Nội dung
API ID
API-05
Method
GET
Endpoint
api/v1/dashboard/sensors/chart
Mô tả
Lấy dữ liệu lịch sử để vẽ biểu đồ đường trên Dashboard. Có thể lọc theo loại cảm biến và khoảng thời gian.
Auth
Có — Bearer Token
Use Case
UC02 – Xem biểu đồ
DB
datasensor, sensor
MQTT
Không
Request Parameters:
Param
Type
Bắt buộc
Mô tả
sensor_id
integer
Không
Lọc theo cảm biến (1=nhiệt độ, 2=độ ẩm, 3=ánh sáng). Mặc định: tất cả
from
string
Không
Thời gian bắt đầu — format yyyy-MM-dd HH:mm:ss
to
string
Không
Thời gian kết thúc — format yyyy-MM-dd HH:mm:ss
limit
integer
Không
Số điểm dữ liệu tối đa (mặc định: 50, tối đa: 200)
Param
Type
Bắt buộc
Mô tả
Ví dụ request:
GET/dashboard/sensors/chart?sensor_id=1&from=2024-01-15 00:00:00&to=2024-01-15 23:59:59&limit=50
Response Body (200 OK):
{
"success": true,
"data": {
"sensor_id": 1,
"sensor_name": "Nhiệt độ",
"unit": "°C",
"points": [
{ "value": 24.50, "recorded_at": "2024-01-15 08:00:00" },
{ "value": 25.00, "recorded_at": "2024-01-15 08:02:00" },
{ "value": 25.50, "recorded_at": "2024-01-15 08:04:00" }
]
}
}
HTTP Status:
Code
Ý nghĩa
200
Thành công
400
Tham số không hợp lệ (vd: from > to)
401
Chưa xác thực
500
Lỗi server
2.4. UC03: Bật/Tắt thiết bị
Thuộc tính
Nội dung
ID
UC03
Tên Use Case
Bật/Tắt thiết bị
Actor
User
Mục đích
Cho phép User điều khiển bật hoặc tắt các đèn LED thông qua giao diện web
Mô tả
User nhấn nút bật/tắt trên Dashboard. Hệ thống gửi lệnh tới thiết bị và ghi lại lịch sử hành động.
Tiền điều kiện
Thiết bị và ESP đang kết nối với hệ thống.
Hành động
ON / OFF
Kết quả
Thiết bị được cập nhật về trạng thái mà người dùng yêu cầu sau khi có phản hồi xác nhận.
Hình  SEQ Hình \* ARABIC 6: Màn bật/tắt thiết bị
Sequence
Hình  SEQ Hình \* ARABIC 7:Sequence bật/tắt thiết bị
Mô tả
Luồng thực hiện
1. Người dùng chọn ON/OFF cho LED 1 hoặc LED 2 trên Dashboard.
2. Giao diện gửi yêu cầu điều khiển đến Backend thông qua API POST /api/devices/{id}/control và hiển thị trạng thái Loading cho thiết bị đang được xử lý.
3. Backend tạo một bản ghi Action với trạng thái LOADING trong cơ sở dữ liệu và nhận lại mã Action.
4. Backend gửi lệnh điều khiển lên MQTT Broker; Broker chuyển lệnh đến ESP32
5. ESP thực hiện lệnh trên phần cứng và gửi phản hồi thành công cùng trạng thái LED thực tế về MQTT Broker.
6. MQTT Broker chuyển phản hồi về Backend để xác định kết quả thực hiện.
7. Khi thiết bị phản hồi thành công, Backend cập nhật Action = SUCCESS đồng thời cập nhật Device.status theo trạng thái thực tế.
8. Backend trả kết quả thành công cùng trạng thái LED về Dashboard; giao diện cập nhật công tắc theo trạng thái đã được phần cứng xác nhận.
Luồng ngoại lệ
E1. ESP không phản hồi hoặc quá 30s → Action được cập nhật thành FAILED, trạng thái LED giữ nguyên.E2. ESP phản hồi lỗi → Hệ thống cập nhật Action thành FAILED và thông báo điều khiển thất bại.E3. Thiết bị đang có lệnh LOADING → Hệ thống không tiếp nhận lệnh mới cho thiết bị đó.
API-08: Lấy ra danh sách các thiết bị
Thuộc tính
Nội dung
API ID
API-08
Method
GET
Endpoint
/api/v1/devices
Description
Lấy ra danh sách các thiết bị
Authentication
Yêu cầu – Bearer Token trong header
Request Header:
Authorization: Bearer <token>
Response Body (200 OK):
[
{
"id": 1,
"name": "LED 1",
"created_at": "2026-12-08 12:00:00"
},
{
"id": 2,
"name": "LED 2",
"created_at": "2026-03-20 12:20:00"
}
]
HTTP Status:
Code
Ý nghĩa
200
Thành công
401
Chưa xác thực
404
Không tìm thấy
500
Lỗi server
API-09: Điều khiển bật/tắt thiết bị
Thuộc tính
Nội dung
API ID
API-09
Method
POST
Endpoint
/api/v1/devices/control
Description
Gửi lệnh bật hoặc tắt thiết bị. BE sẽ publish lệnh qua MQTT và chờ phản hồi từ HW (UC03).
Authentication
Yêu cầu – Bearer Token trong header
Request Header:
Authorization: Bearer <token>
Content-Type: application/json
Request Body:
{
"devices_id": 1,
"action": "on"
}
Field
Type
Bắt buộc
Mô tả
devices_id
int
Có
ID thiết bị cần điều khiển
action
string
Có
"on" hoặc "off"
Response Body (200 OK):
{
"devices_id": 1,
"devices_name": "LED 1",
"action": "on",
"status": "on",
"time": "2026-03-15 12:35:00"
}
HTTP Status:
Code
Ý nghĩa
200
Lệnh thực thi thành công, HW đã phản hồi
400
Dữ liệu đầu vào không hợp lệ
401
Chưa xác thực
404
Thiết bị không tồn tại
504
HW không phản hồi trong thời gian quy định (timeout)
Error Response (timeout):
{
"error": "Thiết bị không phản hồi",
"status": "loading"
}
MQTT Flow:
FE → POST /api/v1/devices/control
→ BE ghi action (status="loading")
→ BE PUBLISH devices_control: {led1: "on", led2: "off", ...}
→ HW nhận lệnh → PUBLISH devices_response: {led1: "on", led2: "off", ...}
→ BE cập nhật action (status="on")
→ BE trả 200 OK cho FE
500
Lỗi server
API-12 - Cập nhật trạng thái từ Hardware (Internal)
Thuộc tính
Nội dung
API ID
API-12
Method
PATCH
Endpoint
/api/v1/devices/:id/status
Mô tả
(Đề xuất thiết kế — Internal API) BE gọi sau khi nhận phản hồi từ MQTT topic device_response. Cập nhật action.status từ loading → on/off.
Auth
Không cần (gọi nội bộ từ MQTT handler trong BE)
Use Case
UC03
DB
action (UPDATE status)
MQTT
Subscribe topic: device_response
Request Body:
{
"led1": "on",
"led2": "off"
}
Response Body (200 OK):
{
"success": true,
"message": "Cập nhật trạng thái thành công"
}
HTTP Status:
Code
Ý nghĩa
200
Cập nhật thành công
400
Payload không hợp lệ
500
Lỗi server
2.5. UC04: Xem lịch sử cảm biến
Thuộc tính
Nội dung
ID
UC4
Tên Use Case
Xem lịch sử cảm biến
Actor
User
Mục đích
Cho phép User xem, tìm kiếm và lọc lịch sử dữ liệu các cảm biến theo thời gian và giá trị
Mô tả
User vào trang Datasensors, xem danh sách dữ liệu cảm biến. Có thể tìm kiếm theo thời gian và lọc theo loại cảm biến (nhiệt độ, ánh sáng).
Tiền điều kiện
Trong hệ thống đã có dữ liệu cảm biến được lưu.
Dữ liệu
Nhiệt độ, độ ẩm, ánh sáng và thời gian ghi nhận.
Kết quả
Danh sách dữ liệu cảm biến được hiển thị theo yêu cầu.
Hình  SEQ Hình \* ARABIC 8: Màn lịch sử cảm biến
Sequence
Hình  SEQ Hình \* ARABIC 9: Sequence xem lịch sử cảm biến
Luồng thực hiện
Người dùng chọn Sensor, Sort và nhấn Tìm kiếm.
Giao diện gửi các điều kiện tra cứu đến Backend thông qua API GET /api/v1/sensors/history.
Backend truy vấn cơ sở dữ liệu theo các điều kiện đã chọn.
Cơ sở dữ liệu trả danh sách dữ liệu cảm biến phù hợp.
Backend trả kết quả tra cứu về giao diện.
Giao diện hiển thị bảng dữ liệu cảm biến cho người dùng.
Luồng ngoại lệ
E1. Không có dữ liệu phù hợp → Hệ thống hiển thị thông báo “Không có dữ liệu”.E2. Không lấy được dữ liệu từ Backend → Hệ thống thông báo lỗi tải dữ liệu.
API-06: Lấy danh sách các cảm biến
Thuộc tính
Nội dung
API ID
API-06
Method
GET
Endpoint
/api/v1/sensors
Description
Lấy danh sách các cảm biến
Authentication
Yêu cầu – Bearer Token trong header
Request Header:
Authorization: Bearer <token>
Response Body (200 OK):
[
{ "id": 1, "name": "Nhiệt độ" },
{ "id": 2, "name": "Độ ẩm" },
{ "id": 3, "name": "Ánh sáng" }
]
API-07: Lấy lịch sử cảm biến
Thuộc tính
Nội dung
API ID
API-07
Method
GET
Endpoint
/api/v1/sensors/history
Description
Lấy lịch sử dữ liệu cảm biến với khả năng tìm kiếm và lọc
Authentication
Yêu cầu – Bearer Token trong header
Request Parameters:
Tham số
Loại
Bắt buộc
Mô tả
sensors_id
Query
Không
Lọc theo ID cảm biến
from
Query
Không
Thời gian bắt đầu (yyyy/mm/dd hh:mm:ss hoặc yyyy/mm/dd hoặc yyyy/mm…)
to
Query
Không
Thời gian kết thúc
page
Query
Không
Trang hiện tại (mặc định: 1)
limit
Query
Không
Số bản ghi mỗi trang (mặc định: 20)
Request Header:
Authorization: Bearer <token>
Response Body (200 OK):
{
"total": 120,
"page": 1,
"limit": 20,
"data": [
{
"id": 1,
"sensors_id": 1,
"sensors_name": "Nhiệt độ",
"value": 28.5,
"time": "2026-03-15 10:30:00"
}
]
}
HTTP Status:
Code
Ý nghĩa
200
Thành công
401
Chưa xác thực
500
Lỗi server
API-11 - Ghi nhận dữ liệu cảm biến từ MQTT (Internal)
Thuộc tính
Nội dung
API ID
API-11
Method
POST
Endpoint
/api/v1/datasensor
Mô tả
(Đề xuất thiết kế — Internal API) BE tự gọi sau khi nhận message từ MQTT topic sensor_data. Lưu giá trị cảm biến vào DB.
Auth
Không cần (gọi nội bộ từ MQTT handler trong BE)
Use Case
UC04 (luồng dữ liệu tự động từ HW)
DB
datasensor
MQTT
Subscribe topic: sensor_data
Request Body:
{
"temp":  25.50,
"humid": 78.00,
"light": 950.00
}
Response Body (201 Created):
{
"success": true,
"message": "Dữ liệu cảm biến đã được lưu",
"data": {
"inserted_count": 3
}
}
HTTP Status:
Code
Ý nghĩa
201
Dữ liệu đã được lưu thành công
400
Payload không hợp lệ
500
Lỗi server
2.6. UC05: Xem lịch sử bật/tắt
Thuộc tính
Nội dung
ID
UC05
Tên Use Case
Xem lịch sử bật/tắt
Actor
User
Mục đích
Cho phép User xem và lọc lịch sử các hành động điều khiển thiết bị (bật/tắt LED)
Mô tả
User vào trang History, xem danh sách các hành động điều khiển đã thực hiện. Có thể lọc theo thiết bị, hành động (bật/tắt), trạng thái (on/loading/off), hoặc tìm kiếm theo thời gian.
Tiền điều kiện
Hệ thống đã có lịch sử điều khiển thiết bị.
Dữ liệu
Thiết bị, hành động, trạng thái và thời gian thực hiện.
Kết quả
Danh sách lịch sử điều khiển được hiển thị cho người dùng.
Hình  SEQ Hình \* ARABIC 10: Màn lịch sử bật tắt
Sequence
Hình  SEQ Hình \* ARABIC 11:Xem lịch sử bật tắt
Mô tả
Luồng thực hiện
Người dùng chọn thiết bị, hành động ON/OFF, trạng thái xử lý, khoảng thời gian và nhấn Tìm kiếm.
Trang Action History gửi các điều kiện tra cứu đến Backend thông qua API GET /api/v1/devices/history.
Backend truy vấn lịch sử điều khiển trong cơ sở dữ liệu theo các điều kiện đã chọn.
Cơ sở dữ liệu trả danh sách Action phù hợp về Backend.
Backend trả kết quả tra cứu về trang Action History.
Giao diện hiển thị bảng lịch sử điều khiển cho người dùng.
Luồng ngoại lệ
E1. Không có lịch sử phù hợp → Hệ thống hiển thị thông báo “Không có dữ liệu”.E2. Khoảng thời gian không hợp lệ (From > To) → Hệ thống yêu cầu người dùng chọn lại khoảng thời gian.E3. Không lấy được dữ liệu lịch sử từ Backend → Hệ thống thông báo lỗi tải dữ liệu.
API-08: Lấy ra danh sách các thiết bị
Thuộc tính
Nội dung
API ID
API-08
Method
GET
Endpoint
/api/v1/devices
Description
Lấy ra danh sách các thiết bị
Authentication
Yêu cầu – Bearer Token trong header
Request Header:
Authorization: Bearer <token>
Response Body (200 OK):
[
{
"id": 1,
"name": "LED 1",
"created_at": "2026-12-08 12:00:00"
},
{
"id": 2,
"name": "LED 2",
"created_at": "2026-03-20 12:20:00"
}
]
HTTP Status:
Code
Ý nghĩa
200
Thành công
401
Chưa xác thực
404
Không tìm thấy
500
Lỗi server
API-10: Lấy lịch sử điều khiển thiết bị
Thuộc tính
Nội dung
API ID
API-10
Method
GET
Endpoint
/api/v1/device/history
Description
Lấy lịch sử các hành động điều khiển thiết bị với khả năng lọc và tìm kiếm theo thời gian
Authentication
Yêu cầu – Bearer Token trong header
Request Parameters:
Tham số
Loại
Bắt buộc
Mô tả
device_id
Query
Không
Lọc theo ID thiết bị
action
Query
Không
Lọc theo hành động: "on" hoặc "off"
status
Query
Không
Lọc theo trạng thái: "on", "off", "loading"
from
Query
Không
Thời gian bắt đầu
to
Query
Không
Thời gian kết thúc
page
Query
Không
Trang hiện tại (mặc định: 1)
limit
Query
Không
Số bản ghi mỗi trang (mặc định: 20)
Request Header:
Authorization: Bearer <token>
Content-Type: application/json
Response Body (200 OK):
{
"total": 55,
"page": 1,
"limit": 20,
"data": [
{
"id": 1,
"device_id": 1,
"device_name": "LED 1",
"action": "on",
"status": "on",
"time": "2026-03-15 12:35:00"
}
]
}
HTTP Status:
Code
Ý nghĩa
200
Thành công
401
Chưa xác thực
500
Lỗi server
CHƯƠNG III: DATABASE
4.1. Tổng quan
Cơ sở dữ liệu của hệ thống IoT có nhiệm vụ:
Lưu thông tin người dùng (xác thực, đăng nhập).
Quản lý danh mục cảm biến và thiết bị.
Lưu trữ dữ liệu đo được từ cảm biến theo thời gian thực.
Ghi lại lịch sử các hành động điều khiển thiết bị.
Hệ quản trị CSDL: MySQL
2.2. Chi tiết các bảng
Hình 7: ERD
Bảng users – Thông tin người dùng
Vai trò: Lưu thông tin xác thực để User đăng nhập vào hệ thống.
Field
Data Type
Key
Ghi chú
id
INT
PK, AUTO_INCREMENT
Khóa chính, tự động tăng
username
VARCHAR(100)
UNIQUE, NOT NULL
Tên đăng nhập, duy nhất
Password
VARCHAR(255)
NOT NULL
Mật khẩu (lưu dạng hash) (Đề xuất thiết kế)
Name
VARCHAR(150)
Họ tên đầy đủ
description
VARCHAR(255)
Mô tả hồ sơ
student_id
VARCHAR(20)
Mã sinh viên
email
VARCHAR(100)
Email của user
avatar_url
VARCHAR(255)
Link avatar
figma_url
VARCHAR(255)
Link figma
postman_url
VARCHAR(255)
Link postman
created_at
DEFAULT CURRENT_TIMESTAMP
Tạo khi nào
Bảng sensors – Danh mục cảm biến
Vai trò: Danh mục các cảm biến trong hệ thống. Mỗi cảm biến có thể có nhiều bản ghi dữ liệu trong bảng datasensors.
Field
Data Type
Key
Ghi chú
id
INT
PK, AUTO_INCREMENT
Khóa chính, tự động tăng
name
VARCHAR(100)
NOT NULL
Tên cảm biến (vd: "Nhiệt độ", "Độ ẩm", "Ánh sáng")
created_at
DEFAULT CURRENT_TIMESTAMP
Thời điểm thêm cảm biến
Bảng devicess – Danh mục thiết bị
Vai trò: Danh mục các thiết bị có thể điều khiển. Mỗi thiết bị có thể có nhiều bản ghi lịch sử trong bảng action.
Field
Data Type
Key
Ghi chú
id
INT
PK, AUTO_INCREMENT
Khóa chính, tự động tăng
name
VARCHAR(100)
NOT NULL
Tên thiết bị (vd: "LED 1", "LED 2", "LED 3")
created_at
DEFAULT CURRENT_TIMESTAMP
Thời điểm thêm thiết bị
Bảng data_sensorss – Dữ liệu đo cảm biến
Vai trò: Lưu trữ toàn bộ dữ liệu đo được từ các cảm biến theo thời gian.
Field
Data Type
Key
Ghi chú
id
INT
PK, AUTO_INCREMENT
Khóa chính, tự động tăng
sensors_id
INT
FK → sensors.id, NOT NULL
Tham chiếu tới cảm biến
value
DOUBLE
NOT NULL
Giá trị đo được
time
DEFAULT CURRENT_TIMESTAMP
NOT NULL
Thời điểm ghi nhận giá trị
Bảng action – Lịch sử hành động bật/tắt
Vai trò: Ghi lại lịch sử mọi hành động điều khiển thiết bị.
Field
Data Type
Key
Ghi chú
id
INT
PK, AUTO_INCREMENT
Khóa chính, tự động tăng
devices_id
INT
FK → devices.id, NOT NULL
Tham chiếu tới thiết bị
user_id
INT
FK -> users.id,
NOT NULL
Tham chiếu tới user
action
ENUM('on', 'off')
NOT NULL
Hành động: "on" hoặc "off"
status
ENUM('on', 'off', 'loading')
NOT NULL
Trạng thái: "on", "loading", hoặc "off"
time
DEFAULT CURRENT_TIMESTAMP
NOT NULL
Thời điểm thực hiện hành động
CHƯƠNG IV. API DOCUMENTATION
5.1. Danh sách API
ID
Method
Endpoint
Mô tả
Use Case
API-01
POST
/api/v1/auth/login
Đăng nhập, nhận token
UC01
API-02
GET
/api/v1/auth/me
Lấy thông tin User đang đăng nhập
Tích hợp UI
API-03
GET
/api/v1/sensors/data
Lấy dữ liệu cảm biến (Dashboard)
UC02
API-04
GET
/api/v1/sensors
Lấy danh mục cảm biến (Filter Dropdown)
UC04
API-05
GET
/api/v1/sensors/history
Lấy lịch sử cảm biến (có filter/search)
UC04
API-06
GET
/api/v1/devices
Lấy danh sách & trạng thái thiết bị hiện tại
UC03
API-07
POST
/api/v1/devices/control
Gửi lệnh bật/tắt thiết bị
UC03
API-08
GET
/api/v1/devices/history
Lấy lịch sử hành động bật/tắt
UC05
4.2. API Authentication
API-01: Đăng nhập hệ thống
Thuộc tính
Nội dung
API ID
API-01
Method
POST
Endpoint
/api/v1/auth/login
Description
Xác thực người dùng bằng username và password. Trả về token nếu hợp lệ.
Authentication
Không yêu cầu (public endpoint)
Request Body:
{
"username": "string",
"password": "string"
}
Response Body (200 OK):
{
"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
"user": {
"id": 1,
"username": "admin",
"name": "Trần Khắc Long"
}
}
HTTP Status:
Code
Ý nghĩa
200
Đăng nhập thành công
400
Thiếu trường bắt buộc
401
Sai username hoặc password
500
Lỗi server
Error Response:
{
"error": "Sai tên đăng nhập hoặc mật khẩu"
}
API-02: Lấy thông tin người dùng
Thuộc tính
Nội dung
API ID
API-02
Method
GET
Endpoint
/api/v1/auth/me
Description
Lấy thông tin User đang đăng nhập
Authentication
Yêu cầu - Bearer Token
Request Header:
Authorization: Bearer <token>
Response Body (200 OK):
{
"id": 1,
"username": "LongLong",
"name": "Trần Khắc Long",
"description": "Mô tả hồ sơ cá nhân",
"student_id": "B23DCCN511",
"email": "tklongb23dccn511@gmail.com",
"avatar_url": "https://example.com/avatar.jpg",
"figma_url": "https://figma.com/file/...",
"postman_url": "https://postman.com/workspace/...",
"created_at": "2026-08-19 14:00:00"
}
Code
Ý nghĩa
200
Đăng nhập thành công
400
Thiếu trường bắt buộc
401
Sai username hoặc password
500
Lỗi server
API-03: Đăng xuất
Thuộc tính
Nội dung
API ID
API-03
Method
POST
Endpoint
/api/v1/auth/logout
Mô tả
Đăng xuất người dùng. FE xóa token khỏi storage. (Đề xuất thiết kế: BE có thể thêm token vào blacklist nếu cần)
Auth
Có — Bearer Token
Use Case
UC01
DB
Không
MQTT
Không
Request Header:
Authorization: Bearer <token>
Response Body (200 OK):
{
"success": true,
"message": "Đăng xuất thành công"
}
HTTP Status:
Code
Ý nghĩa
200
Đăng xuất thành công
401
Token không hợp lệ/hết hạn
4.3. API Sensors
API-04: Lấy dữ liệu cảm biến
Thuộc tính
Nội dung
API ID
API-04
Method
GET
Endpoint
/api/v1/sensors/data
Description
Lấy dữ liệu cảm biến mới nhất để hiển thị biểu đồ trên Dashboard
Authentication
Yêu cầu – Bearer Token trong header
UseCase
UC02
Request Parameters:
Tham số
Loại
Bắt buộc
Mô tả
limit
Query
Không
Số lượng bản ghi trả về (mặc định: 50)
Request Header:
Authorization: Bearer <token>
Response Body (200 OK):
[
{
"sensors_id": 1,
"sensors_name": "Nhiệt độ",
"value": 35.5,
"time": "2026-03-15 12:30:00"
},
{
"sensors_id": 2,
"sensors_name": "Độ ẩm",
"value": 80.0,
"time": "2026-03-15 12:30:00"
},
{
"sensors_id": 3,
"sensors_name": "Ánh sáng",
"value": 1200.0,
"time": "2026-03-15 12:30:00"
}
]
HTTP Status:
Code
Ý nghĩa
200
Thành công
401
Chưa xác thực
500
Lỗi server
API-05: Lấy dữ liệu biểu đồ
Thuộc tính
Nội dung
API ID
API-05
Method
GET
Endpoint
api/v1/dashboard/sensors/chart
Mô tả
Lấy dữ liệu lịch sử để vẽ biểu đồ đường trên Dashboard. Có thể lọc theo loại cảm biến và khoảng thời gian.
Auth
Có — Bearer Token
Use Case
UC02 – Xem biểu đồ
DB
datasensor, sensor
MQTT
Không
Request Parameters:
Param
Type
Bắt buộc
Mô tả
sensor_id
integer
Không
Lọc theo cảm biến (1=nhiệt độ, 2=độ ẩm, 3=ánh sáng). Mặc định: tất cả
from
string
Không
Thời gian bắt đầu — format yyyy-MM-dd HH:mm:ss
to
string
Không
Thời gian kết thúc — format yyyy-MM-dd HH:mm:ss
limit
integer
Không
Số điểm dữ liệu tối đa (mặc định: 50, tối đa: 200)
Param
Type
Bắt buộc
Mô tả
Ví dụ request:
GET/dashboard/sensors/chart?sensor_id=1&from=2024-01-15 00:00:00&to=2024-01-15 23:59:59&limit=50
Response Body (200 OK):
{
"success": true,
"data": {
"sensor_id": 1,
"sensor_name": "Nhiệt độ",
"unit": "°C",
"points": [
{ "value": 24.50, "recorded_at": "2024-01-15 08:00:00" },
{ "value": 25.00, "recorded_at": "2024-01-15 08:02:00" },
{ "value": 25.50, "recorded_at": "2024-01-15 08:04:00" }
]
}
}
HTTP Status:
Code
Ý nghĩa
200
Thành công
400
Tham số không hợp lệ (vd: from > to)
401
Chưa xác thực
500
Lỗi server
API-06: Lấy danh sách các cảm biến
Thuộc tính
Nội dung
API ID
API-06
Method
GET
Endpoint
/api/v1/sensors
Description
Lấy danh sách các cảm biến
Authentication
Yêu cầu – Bearer Token trong header
Request Header:
Authorization: Bearer <token>
Response Body (200 OK):
[
{ "id": 1, "name": "Nhiệt độ" },
{ "id": 2, "name": "Độ ẩm" },
{ "id": 3, "name": "Ánh sáng" }
]
API-07: Lấy lịch sử cảm biến
Thuộc tính
Nội dung
API ID
API-07
Method
GET
Endpoint
/api/v1/sensors/history
Description
Lấy lịch sử dữ liệu cảm biến với khả năng tìm kiếm và lọc
Authentication
Yêu cầu – Bearer Token trong header
Request Parameters:
Tham số
Loại
Bắt buộc
Mô tả
sensors_id
Query
Không
Lọc theo ID cảm biến
from
Query
Không
Thời gian bắt đầu (yyyy/mm/dd hh:mm:ss hoặc yyyy/mm/dd hoặc yyyy/mm…)
to
Query
Không
Thời gian kết thúc
page
Query
Không
Trang hiện tại (mặc định: 1)
limit
Query
Không
Số bản ghi mỗi trang (mặc định: 20)
Request Header:
Authorization: Bearer <token>
Response Body (200 OK):
{
"total": 120,
"page": 1,
"limit": 20,
"data": [
{
"id": 1,
"sensors_id": 1,
"sensors_name": "Nhiệt độ",
"value": 28.5,
"time": "2026-03-15 10:30:00"
}
]
}
HTTP Status:
Code
Ý nghĩa
200
Thành công
401
Chưa xác thực
500
Lỗi server
4.4. API Devices
API-08: Lấy ra danh sách các thiết bị
Thuộc tính
Nội dung
API ID
API-08
Method
GET
Endpoint
/api/v1/devices
Description
Lấy ra danh sách các thiết bị
Authentication
Yêu cầu – Bearer Token trong header
Request Header:
Authorization: Bearer <token>
Response Body (200 OK):
[
{
"id": 1,
"name": "LED 1",
"created_at": "2026-12-08 12:00:00"
},
{
"id": 2,
"name": "LED 2",
"created_at": "2026-03-20 12:20:00"
}
]
HTTP Status:
Code
Ý nghĩa
200
Thành công
401
Chưa xác thực
404
Không tìm thấy
500
Lỗi server
API-09: Điều khiển bật/tắt thiết bị
Thuộc tính
Nội dung
API ID
API-09
Method
POST
Endpoint
/api/v1/devices/control
Description
Gửi lệnh bật hoặc tắt thiết bị. BE sẽ publish lệnh qua MQTT và chờ phản hồi từ HW (UC03).
Authentication
Yêu cầu – Bearer Token trong header
Request Header:
Authorization: Bearer <token>
Content-Type: application/json
Request Body:
{
"devices_id": 1,
"action": "on"
}
Field
Type
Bắt buộc
Mô tả
devices_id
int
Có
ID thiết bị cần điều khiển
action
string
Có
"on" hoặc "off"
Response Body (200 OK):
{
"devices_id": 1,
"devices_name": "LED 1",
"action": "on",
"status": "on",
"time": "2026-03-15 12:35:00"
}
HTTP Status:
Code
Ý nghĩa
200
Lệnh thực thi thành công, HW đã phản hồi
400
Dữ liệu đầu vào không hợp lệ
401
Chưa xác thực
404
Thiết bị không tồn tại
504
HW không phản hồi trong thời gian quy định (timeout)
Error Response (timeout):
{
"error": "Thiết bị không phản hồi",
"status": "loading"
}
MQTT Flow:
FE → POST /api/v1/devices/control
→ BE ghi action (status="loading")
→ BE PUBLISH devices_control: {led1: "on", led2: "off", ...}
→ HW nhận lệnh → PUBLISH devices_response: {led1: "on", led2: "off", ...}
→ BE cập nhật action (status="on")
→ BE trả 200 OK cho FE
API-10: Lấy lịch sử điều khiển thiết bị
Thuộc tính
Nội dung
API ID
API-10
Method
GET
Endpoint
/api/v1/device/history
Description
Lấy lịch sử các hành động điều khiển thiết bị với khả năng lọc và tìm kiếm theo thời gian
Authentication
Yêu cầu – Bearer Token trong header
Request Parameters:
Tham số
Loại
Bắt buộc
Mô tả
device_id
Query
Không
Lọc theo ID thiết bị
action
Query
Không
Lọc theo hành động: "on" hoặc "off"
status
Query
Không
Lọc theo trạng thái: "on", "off", "loading"
from
Query
Không
Thời gian bắt đầu
to
Query
Không
Thời gian kết thúc
page
Query
Không
Trang hiện tại (mặc định: 1)
limit
Query
Không
Số bản ghi mỗi trang (mặc định: 20)
Request Header:
Authorization: Bearer <token>
Content-Type: application/json
Response Body (200 OK):
{
"total": 55,
"page": 1,
"limit": 20,
"data": [
{
"id": 1,
"device_id": 1,
"device_name": "LED 1",
"action": "on",
"status": "on",
"time": "2026-03-15 12:35:00"
}
]
}
HTTP Status:
Code
Ý nghĩa
200
Thành công
401
Chưa xác thực
500
Lỗi server
4.5 API MQTT
API-11 - Ghi nhận dữ liệu cảm biến từ MQTT (Internal)
Thuộc tính
Nội dung
API ID
API-11
Method
POST
Endpoint
/api/v1/datasensor
Mô tả
(Đề xuất thiết kế — Internal API) BE tự gọi sau khi nhận message từ MQTT topic sensor_data. Lưu giá trị cảm biến vào DB.
Auth
Không cần (gọi nội bộ từ MQTT handler trong BE)
Use Case
UC04 (luồng dữ liệu tự động từ HW)
DB
datasensor
MQTT
Subscribe topic: sensor_data
Request Body:
{
"temp":  25.50,
"humid": 78.00,
"light": 950.00
}
Response Body (201 Created):
{
"success": true,
"message": "Dữ liệu cảm biến đã được lưu",
"data": {
"inserted_count": 3
}
}
HTTP Status:
Code
Ý nghĩa
201
Dữ liệu đã được lưu thành công
400
Payload không hợp lệ
500
Lỗi server
API-12: Cập nhật trạng thái từ Hardware (Internal)
Thuộc tính
Nội dung
API ID
API-12
Method
PATCH
Endpoint
/api/v1/devices/:id/status
Mô tả
(Đề xuất thiết kế — Internal API) BE gọi sau khi nhận phản hồi từ MQTT topic device_response. Cập nhật action.status từ loading → on/off.
Auth
Không cần (gọi nội bộ từ MQTT handler trong BE)
Use Case
UC03
DB
action (UPDATE status)
MQTT
Subscribe topic: device_response
Request Body:
{
"led1": "on",
"led2": "off"
}
Response Body (200 OK):
{
"success": true,
"message": "Cập nhật trạng thái thành công"
}
HTTP Status:
Code
Ý nghĩa
200
Cập nhật thành công
400
Payload không hợp lệ
500
Lỗi server