const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, BorderStyle, PageBreak, ShadingType,
  WidthType, Tab, TabStopType, TabStopPosition, TableOfContents,
  Header, Footer, PageNumber, NumberFormat, LevelFormat,
  convertInchesToTwip, LineRuleType, UnderlineType,
} = require("docx");

// Helper: create a paragraph with specific formatting
function p(text, options = {}) {
  return new Paragraph({
    spacing: { after: 120, line: 360 },
    ...options,
    children: [
      new TextRun({
        text,
        font: "Times New Roman",
        size: options.fontSize || 26, // 13pt default
        bold: options.bold || false,
        italics: options.italics || false,
        color: "000000",
        ...options.runOptions,
      }),
    ],
  });
}

function heading(text, level) {
  return new Paragraph({
    heading: level,
    alignment: level === HeadingLevel.HEADING_1 ? AlignmentType.CENTER : AlignmentType.LEFT,
    spacing: { before: level === HeadingLevel.HEADING_1 ? 360 : 240, after: 180 },
    children: [
      new TextRun({
        text,
        font: "Times New Roman",
        size: level === HeadingLevel.HEADING_1 ? 32 : level === HeadingLevel.HEADING_2 ? 28 : 26,
        bold: true,
        color: "000000",
      }),
    ],
  });
}

// Table of Contents (auto-generated when opened in Word)
function tableOfContents() {
  return new TableOfContents("Mục lục", {
    hyperlink: true,
    headingStyleRange: "1-3",
    stylesWithLevels: [
      { level: 1, style: "Heading 1" },
      { level: 2, style: "Heading 2" },
      { level: 3, style: "Heading 3" },
    ],
  });
}

function emptyLine() {
  return new Paragraph({ spacing: { after: 0 }, children: [] });
}

function bulletPoint(text, level = 0) {
  return new Paragraph({
    spacing: { after: 60, line: 360 },
    indent: { left: convertInchesToTwip(0.5 + level * 0.3) },
    children: [
      new TextRun({ text: "• ", font: "Times New Roman", size: 26, color: "000000" }),
      new TextRun({ text, font: "Times New Roman", size: 26, color: "000000" }),
    ],
  });
}

function numberedPoint(num, text, indent = 0) {
  return new Paragraph({
    spacing: { after: 60, line: 360 },
    indent: { left: convertInchesToTwip(0.5 + indent * 0.3) },
    children: [
      new TextRun({ text: `${num}. `, font: "Times New Roman", size: 26, bold: true, color: "000000" }),
      new TextRun({ text, font: "Times New Roman", size: 26, color: "000000" }),
    ],
  });
}

function codeBlock(code) {
  return new Paragraph({
    spacing: { after: 60, before: 60 },
    indent: { left: convertInchesToTwip(0.3) },
    shading: { type: ShadingType.SOLID, color: "F0F0F0", fill: "F0F0F0" },
    children: [
      new TextRun({
        text: code,
        font: "Courier New",
        size: 18, // 9pt
        color: "000000",
      }),
    ],
  });
}

// Create table from 2D array
function createTable(headers, rows) {
  const allRows = [
    new TableRow({
      tableHeader: true,
      children: headers.map(h =>
        new TableCell({
          shading: { type: ShadingType.SOLID, color: "4472C4", fill: "4472C4" },
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: h, font: "Times New Roman", size: 22, bold: true, color: "FFFFFF" })],
          })],
        })
      ),
    }),
    ...rows.map(row =>
      new TableRow({
        children: row.map(cell =>
          new TableCell({
            children: [new Paragraph({
              children: [new TextRun({ text: String(cell), font: "Times New Roman", size: 22, color: "000000" })],
            })],
          })
        ),
      })
    ),
  ];

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: allRows,
  });
}

// ==================== BUILD DOCUMENT ====================

const doc = new Document({
  styles: {
    default: {
      document: {
        run: { font: "Times New Roman", size: 26 },
      },
    },
  },
  sections: [
    // ── TITLE PAGE ──
    {
      properties: {
        page: {
          margin: { top: 720, bottom: 720, left: 720, right: 720 },
        },
      },
      children: [
        emptyLine(), emptyLine(), emptyLine(), emptyLine(),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
          children: [
            new TextRun({ text: "BÁO CÁO CUỐI KHÓA", font: "Times New Roman", size: 36, bold: true }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 },
          children: [
            new TextRun({ text: "MÔN: CÔNG NGHỆ BLOCKCHAIN", font: "Times New Roman", size: 28, bold: true }),
          ],
        }),
        emptyLine(), emptyLine(),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
          children: [
            new TextRun({ text: "ĐỀ TÀI:", font: "Times New Roman", size: 26, italics: true }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 },
          children: [
            new TextRun({
              text: "HỆ THỐNG MÁY BÁN HÀNG TỰ ĐỘNG THÔNG MINH",
              font: "Times New Roman", size: 36, bold: true, color: "1F4E79",
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 },
          children: [
            new TextRun({
              text: "TÍCH HỢP BLOCKCHAIN VÀ IoT",
              font: "Times New Roman", size: 36, bold: true, color: "1F4E79",
            }),
          ],
        }),
        emptyLine(), emptyLine(), emptyLine(),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 80 },
          children: [
            new TextRun({ text: "Giảng viên hướng dẫn: TS. Nguyễn Văn A", font: "Times New Roman", size: 26 }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
          children: [
            new TextRun({ text: "Sinh viên thực hiện:", font: "Times New Roman", size: 26 }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 60 },
          children: [
            new TextRun({ text: "Họ và tên - MSSV", font: "Times New Roman", size: 26 }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
          children: [
            new TextRun({ text: "Lớp: Công nghệ Blockchain", font: "Times New Roman", size: 26 }),
          ],
        }),
        emptyLine(), emptyLine(),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: "Hà Nội, tháng 6 năm 2026", font: "Times New Roman", size: 26, bold: true }),
          ],
        }),
      ],
    },

    // ── REST OF REPORT ──
    {
      properties: {
        page: {
          margin: { top: 720, bottom: 720, left: 1080, right: 720 },
        },
      },
      headers: {
        default: new Header({
          children: [new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [new TextRun({ text: "Hệ thống máy bán hàng tự động thông minh tích hợp Blockchain và IoT", font: "Times New Roman", size: 18, italics: true, color: "888888" })],
          })],
        }),
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: "Trang ", font: "Times New Roman", size: 18 }),
              new TextRun({ children: [PageNumber.CURRENT], font: "Times New Roman", size: 18 }),
            ],
          })],
        }),
      },
      children: [
        // ── ACKNOWLEDGEMENTS ──
        heading("LỜI CẢM ƠN", HeadingLevel.HEADING_1),
        emptyLine(),
        p("Em xin gửi lời cảm ơn chân thành đến các thầy cô trong bộ môn Công nghệ Thông tin, đặc biệt là thầy TS. Nguyễn Văn A - người đã trực tiếp hướng dẫn, định hướng và góp ý quý báu trong suốt quá trình thực hiện đề tài."),
        p("Em cũng xin cảm ơn các bạn trong nhóm đã cùng nhau nỗ lực, hợp tác và chia sẻ kiến thức để hoàn thành hệ thống này. Sự kết hợp giữa các thành viên với các thế mạnh khác nhau về phát triển ứng dụng di động, lập trình nhúng IoT và công nghệ blockchain đã giúp dự án được triển khai một cách toàn diện."),
        p("Trong quá trình thực hiện, nhóm đã nhận được sự hỗ trợ từ cộng đồng mã nguồn mở với các thư viện và công cụ như Flutter, Ethers.js, PlatformIO, Firebase và nhiều dự án khác. Xin gửi lời cảm ơn đến các nhà phát triển đã đóng góp cho cộng đồng."),
        p("Mặc dù đã cố gắng hết sức, nhưng do thời gian và kiến thức còn hạn chế, hệ thống không tránh khỏi những thiếu sót. Nhóm rất mong nhận được sự góp ý từ thầy cô và các bạn để hệ thống được hoàn thiện hơn."),
        p("Xin trân trọng cảm ơn!"),

        // ── ABSTRACT ──
        new Paragraph({ children: [new PageBreak()] }),
        heading("TÓM TẮT ĐỀ TÀI", HeadingLevel.HEADING_1),
        emptyLine(),
        p("Hệ thống máy bán hàng tự động thông minh tích hợp Blockchain và IoT là một giải pháp kết hợp ba lĩnh vực công nghệ tiên tiến: Blockchain (chuỗi khối), Internet of Things (Internet vạn vật) và Mobile Computing (điện toán di động). Hệ thống hướng đến việc xây dựng một mô hình máy bán hàng tự động hiện đại, nơi giao dịch được xử lý minh bạch thông qua công nghệ blockchain, thiết bị nhúng IoT điều khiển phần cứng, và ứng dụng di động cung cấp trải nghiệm người dùng liền mạch."),
        p("Về mặt Blockchain, hệ thống sử dụng mạng thử nghiệm Ethereum Sepolia để xử lý thanh toán. Mỗi giao dịch mua hàng là một giao dịch ETH được ghi nhận vĩnh viễn trên chuỗi khối, đảm bảo tính minh bạch, không thể thay đổi và chống gian lận. Backend hệ thống đóng vai trò xác minh giao dịch trên blockchain trước khi thực hiện quá trình phân phối sản phẩm."),
        p("Về mặt IoT, hệ thống sử dụng vi điều khiển ESP32 kết nối với màn hình TFT, cảm biến hồng ngoại, động cơ DC, servo và còi buzzer để tạo thành một máy bán hàng vật lý hoàn chỉnh. Firmware được phát triển trên nền tảng PlatformIO, hỗ trợ kết nối WiFi, đồng bộ thời gian NTP, và giao tiếp hai chiều với backend thông qua REST API."),
        p("Về mặt Mobile, ứng dụng Flutter cung cấp giao diện người dùng với các chức năng: đăng nhập bằng ví Web3 (Web3Auth + Google), tìm kiếm máy bán hàng gần nhất qua GPS, tham gia hàng đợi ảo, thực hiện giao dịch ETH, và theo dõi trạng thái đơn hàng theo thời gian thực qua WebSocket."),
        p("Hệ thống đã được triển khai thành công trên môi trường thử nghiệm, chứng minh tính khả thi của việc kết hợp Blockchain và IoT trong lĩnh vực bán lẻ tự động."),
        emptyLine(),
        p("Từ khóa: Blockchain, Ethereum, Smart Contract, IoT, ESP32, Flutter, Web3, Máy bán hàng tự động, Thanh toán phi tập trung", { italics: true }),

        // ── TABLE OF CONTENTS ──
        new Paragraph({ children: [new PageBreak()] }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 360 },
          children: [
            new TextRun({ text: "MỤC LỤC", font: "Times New Roman", size: 32, bold: true, color: "000000" }),
          ],
        }),
        emptyLine(),
        tableOfContents(),
        emptyLine(),
        p("Lưu ý: Nhấn chuột phải vào mục lục và chọn \"Cập nhật trường\" (Update Field) để hiển thị số trang chính xác.", { italics: true, fontSize: 20, runOptions: { color: "888888" } }),

        // ── CHAPTER 1: INTRODUCTION ──
        new Paragraph({ children: [new PageBreak()] }),
        heading("CHƯƠNG 1: TỔNG QUAN ĐỀ TÀI", HeadingLevel.HEADING_1),
        emptyLine(),
        heading("1.1 Đặt vấn đề", HeadingLevel.HEADING_2),
        heading("1.1.1 Bối cảnh thực tế", HeadingLevel.HEADING_3),
        p("Trong bối cảnh cuộc Cách mạng Công nghiệp 4.0, các công nghệ tiên tiến như Blockchain, Internet of Things (IoT) và Trí tuệ Nhân tạo (AI) đang dần thay đổi mọi mặt của đời sống kinh tế - xã hội. Lĩnh vực bán lẻ tự động, đặc biệt là máy bán hàng tự động (vending machine), cũng không nằm ngoài xu hướng này."),
        p("Máy bán hàng tự động truyền thống đã tồn tại từ những năm 1880 và phát triển mạnh mẽ trên toàn thế giới. Tuy nhiên, các hệ thống máy bán hàng hiện tại vẫn còn tồn tại nhiều vấn đề:"),
        emptyLine(),
        numberedPoint(1, "Thiếu minh bạch trong giao dịch: Người dùng không thể xác minh độc lập rằng giao dịch của họ đã được xử lý chính xác. Mọi thông tin giao dịch đều do nhà vận hành kiểm soát và có thể bị thay đổi."),
        numberedPoint(2, "Rủi ro gian lận thanh toán: Các hệ thống thanh toán tập trung dễ bị tấn công, giả mạo giao dịch hoặc từ chối giao dịch mà không có bằng chứng."),
        numberedPoint(3, "Phụ thuộc vào bên thứ ba: Các hệ thống thanh toán truyền thống yêu cầu thông qua ngân hàng hoặc nhà cung cấp dịch vụ thanh toán, làm tăng chi phí giao dịch và thời gian xử lý."),
        numberedPoint(4, "Khó khăn trong quản lý hàng đợi: Tại các địa điểm đông người, việc xếp hàng chờ mua hàng tại máy bán hàng gây mất thời gian và bất tiện cho người dùng."),
        numberedPoint(5, "Hạn chế tương tác từ xa: Người dùng không thể kiểm tra tình trạng máy (còn hàng không, đang có người dùng không) từ xa trước khi đến mua hàng."),
        emptyLine(),

        heading("1.1.2 Giải pháp đề xuất", HeadingLevel.HEADING_3),
        p("Để giải quyết các vấn đề trên, nhóm chúng em đề xuất xây dựng Hệ thống máy bán hàng tự động thông minh tích hợp Blockchain và IoT - một hệ thống kết hợp ba trụ cột công nghệ:"),
        emptyLine(),
        bulletPoint("Blockchain (Ethereum): Cung cấp lớp thanh toán phi tập trung, minh bạch và không thể thay đổi. Mỗi giao dịch mua hàng được ghi nhận vĩnh viễn trên chuỗi khối, cho phép bất kỳ ai cũng có thể kiểm tra và xác minh."),
        bulletPoint("Internet of Things (ESP32): Điều khiển phần cứng máy bán hàng vật lý bao gồm động cơ, cảm biến, màn hình hiển thị, tạo ra trải nghiệm mua hàng thực tế."),
        bulletPoint("Mobile App (Flutter): Cung cấp giao diện người dùng thân thiện, cho phép đăng nhập bằng ví tiền mã hóa, tìm máy bán hàng gần nhất, tham gia hàng đợi ảo, và thực hiện giao dịch một cách liền mạch."),
        emptyLine(),
        p("Hệ thống hoạt động theo mô hình: người dùng sử dụng ứng dụng di động để tìm máy bán hàng gần nhất, tham gia hàng đợi ảo, khi đến lượt sẽ chọn sản phẩm và gửi ETH đến ví của máy bán hàng. Backend xác minh giao dịch trên blockchain, sau đó gửi lệnh đến ESP32 để phân phối sản phẩm. Toàn bộ quá trình được thông báo theo thời gian thực qua WebSocket."),

        heading("1.2 Mục tiêu đề tài", HeadingLevel.HEADING_2),
        heading("1.2.1 Mục tiêu chung", HeadingLevel.HEADING_3),
        p("Xây dựng thành công một hệ thống máy bán hàng tự động hoàn chỉnh, tích hợp công nghệ Blockchain cho thanh toán minh bạch và công nghệ IoT cho điều khiển phần cứng, tạo ra một mô hình bán lẻ tự động thế hệ mới."),
        heading("1.2.2 Mục tiêu cụ thể", HeadingLevel.HEADING_3),
        numberedPoint(1, "Thiết kế và triển khai lớp thanh toán Blockchain:"),
        bulletPoint("Tích hợp mạng Ethereum Sepolia Testnet để xử lý thanh toán", 1),
        bulletPoint("Xây dựng cơ chế xác minh giao dịch tự động trên backend", 1),
        bulletPoint("Đảm bảo mỗi giao dịch được ghi nhận công khai, không thể thay đổi", 1),
        numberedPoint(2, "Xây dựng hệ thống IoT cho máy bán hàng vật lý:"),
        bulletPoint("Phát triển firmware cho ESP32 điều khiển 4 khe chứa sản phẩm", 1),
        bulletPoint("Tích hợp màn hình TFT hiển thị thông tin đơn hàng, thời gian, thời tiết", 1),
        bulletPoint("Kết nối WiFi và giao tiếp với backend qua REST API", 1),
        bulletPoint("Điều khiển động cơ DC, servo cửa, cảm biến hồng ngoại, còi buzzer", 1),
        numberedPoint(3, "Phát triển ứng dụng di động Flutter:"),
        bulletPoint("Đăng nhập bằng ví Web3 (Web3Auth + Google)", 1),
        bulletPoint("Tìm kiếm máy bán hàng gần nhất dựa trên GPS", 1),
        bulletPoint("Tham gia hàng đợi ảo và nhận thông báo thời gian thực", 1),
        bulletPoint("Gửi giao dịch ETH và theo dõi trạng thái đơn hàng", 1),
        numberedPoint(4, "Xây dựng backend quản lý hệ thống:"),
        bulletPoint("API quản lý máy bán hàng, sản phẩm, đơn hàng", 1),
        bulletPoint("Hệ thống quản lý hàng đợi thông minh với cơ chế timeout", 1),
        bulletPoint("Giao tiếp thời gian thực qua WebSocket (Socket.io)", 1),
        bulletPoint("CLI tool cho quản trị viên", 1),

        heading("1.3 Phạm vi và giới hạn", HeadingLevel.HEADING_2),
        p("Phạm vi đề tài:", { bold: true }),
        bulletPoint("Sử dụng mạng thử nghiệm Ethereum Sepolia (không dùng mainnet)"),
        bulletPoint("Giá sản phẩm cố định: 0.001 ETH"),
        bulletPoint("Phạm vi địa lý: khu vực Hà Nội (tọa độ mặc định)"),
        bulletPoint("Phần cứng: 4 khe chứa sản phẩm, mỗi khe có thể chứa nhiều sản phẩm"),
        bulletPoint("Ví thanh toán: hỗ trợ ví tạo qua Web3Auth (Google login)"),
        emptyLine(),
        p("Giới hạn:", { bold: true }),
        bulletPoint("Không hỗ trợ thanh toán bằng tiền pháp định (VND, USD)"),
        bulletPoint("Không hỗ trợ nhiều loại tiền mã hóa (chỉ ETH)"),
        bulletPoint("Phần cứng là phiên bản thử nghiệm, chưa đạt tiêu chuẩn thương mại"),
        bulletPoint("Phụ thuộc vào tốc độ xác nhận giao dịch của mạng Sepolia"),
        bulletPoint("Chưa có cơ chế hoàn tiền tự động trên blockchain"),

        heading("1.4 Phương pháp nghiên cứu", HeadingLevel.HEADING_2),
        numberedPoint(1, "Nghiên cứu lý thuyết:"),
        bulletPoint("Nghiên cứu tài liệu về công nghệ Blockchain, Ethereum và Smart Contract", 1),
        bulletPoint("Nghiên cứu về kiến trúc IoT, ESP32 và các giao thức giao tiếp", 1),
        bulletPoint("Nghiên cứu về phát triển ứng dụng di động với Flutter", 1),
        numberedPoint(2, "Phương pháp phát triển phần mềm:"),
        bulletPoint("Áp dụng mô hình phát triển linh hoạt (Agile)", 1),
        bulletPoint("Phân chia hệ thống thành các module độc lập để phát triển song song", 1),
        bulletPoint("Sử dụng Git để quản lý mã nguồn và phiên bản", 1),
        numberedPoint(3, "Phương pháp kiểm thử:"),
        bulletPoint("Kiểm thử đơn vị (unit test) cho từng module", 1),
        bulletPoint("Kiểm thử tích hợp (integration test) giữa các thành phần", 1),
        bulletPoint("Kiểm thử toàn hệ thống (system test) với kịch bản thực tế", 1),

        heading("1.5 Bố cục báo cáo", HeadingLevel.HEADING_2),
        p("Báo cáo được tổ chức thành 6 chương:"),
        bulletPoint("Chương 1: Tổng quan đề tài — Trình bày bối cảnh, vấn đề, mục tiêu và phạm vi"),
        bulletPoint("Chương 2: Cơ sở lý thuyết — Tổng hợp kiến thức nền tảng về Blockchain, Ethereum, IoT"),
        bulletPoint("Chương 3: Kiến trúc hệ thống — Mô tả kiến trúc tổng thể và từng lớp thành phần"),
        bulletPoint("Chương 4: Thiết kế chi tiết và triển khai — Trình bày chi tiết các module chính"),
        bulletPoint("Chương 5: Kiểm thử và kết quả — Mô tả các kịch bản kiểm thử và đánh giá"),
        bulletPoint("Chương 6: Kết luận và hướng phát triển — Tổng kết và đề xuất nghiên cứu tiếp theo"),

        // ── CHAPTER 2: THEORETICAL FOUNDATION ──
        new Paragraph({ children: [new PageBreak()] }),
        heading("CHƯƠNG 2: CƠ SỞ LÝ THUYẾT", HeadingLevel.HEADING_1),
        emptyLine(),
        heading("2.1 Tổng quan về công nghệ Blockchain", HeadingLevel.HEADING_2),
        heading("2.1.1 Khái niệm Blockchain", HeadingLevel.HEADING_3),
        p("Blockchain (chuỗi khối) là một công nghệ lưu trữ và truyền tải thông tin bằng các khối được liên kết với nhau bằng mật mã. Mỗi khối chứa thông tin về các giao dịch, một mã băm (hash) của chính nó, mã băm của khối trước đó, và một dấu thời gian (timestamp). Các khối được liên kết với nhau tạo thành một chuỗi, vì vậy được gọi là \"chuỗi khối\"."),
        p("Blockchain thuộc loại công nghệ Distributed Ledger Technology (DLT) - sổ cái phân tán. Thay vì dữ liệu được lưu trữ tập trung tại một máy chủ, dữ liệu được phân phối và đồng bộ trên nhiều nút mạng (node). Mỗi nút mạng đều có một bản sao đầy đủ của chuỗi khối."),

        heading("2.1.2 Đặc tính của Blockchain", HeadingLevel.HEADING_3),
        p("Blockchain có bốn đặc tính cơ bản:"),
        numberedPoint(1, "Phi tập trung (Decentralization): Không có một thực thể trung tâm nào kiểm soát toàn bộ hệ thống. Mọi quyết định được đưa ra thông qua cơ chế đồng thuận của mạng lưới các nút."),
        numberedPoint(2, "Minh bạch (Transparency): Tất cả giao dịch trên blockchain đều có thể được xem công khai bởi bất kỳ ai. Điều này đảm bảo tính minh bạch và có thể kiểm toán."),
        numberedPoint(3, "Bất biến (Immutability): Một khi giao dịch đã được ghi vào blockchain và được xác nhận bởi mạng lưới, nó không thể bị thay đổi hoặc xóa bỏ. Điều này có được nhờ cấu trúc liên kết mật mã giữa các khối."),
        numberedPoint(4, "Bảo mật (Security): Blockchain sử dụng các thuật toán mật mã mạnh mẽ (SHA-256, ECDSA) để đảm bảo tính toàn vẹn, xác thực và chống giả mạo."),

        heading("2.1.3 Cấu trúc của một khối (Block)", HeadingLevel.HEADING_3),
        p("Mỗi khối trong blockchain bao gồm hai phần chính:"),
        p("Phần tiêu đề khối (Block Header):", { bold: true }),
        bulletPoint("Previous Block Hash: Mã băm của khối trước đó, tạo liên kết giữa các khối"),
        bulletPoint("Merkle Root: Mã băm gốc của cây Merkle chứa tất cả giao dịch trong khối"),
        bulletPoint("Timestamp: Dấu thời gian khi khối được tạo"),
        bulletPoint("Nonce: Một số ngẫu nhiên được sử dụng trong quá trình khai thác (mining)"),
        bulletPoint("Difficulty Target: Độ khó của mạng lưới tại thời điểm khai thác"),
        emptyLine(),
        p("Phần thân khối (Block Body):", { bold: true }),
        bulletPoint("Danh sách các giao dịch đã được xác nhận"),
        bulletPoint("Mỗi giao dịch bao gồm: địa chỉ gửi, địa chỉ nhận, giá trị, chữ ký số"),
        emptyLine(),
        p("Mã băm của mỗi khối được tính từ nội dung của khối đó. Nếu bất kỳ dữ liệu nào trong khối bị thay đổi, mã băm sẽ thay đổi hoàn toàn, phá vỡ liên kết với khối tiếp theo. Điều này tạo nên tính bất biến của blockchain."),

        heading("2.1.4 Cơ chế đồng thuận (Consensus Mechanism)", HeadingLevel.HEADING_3),
        p("Cơ chế đồng thuận là cách mà các nút trong mạng blockchain thống nhất về trạng thái của chuỗi khối. Các cơ chế đồng thuận phổ biến:"),
        emptyLine(),
        p("Proof of Work (PoW):", { bold: true }),
        bulletPoint("Được sử dụng bởi Bitcoin và Ethereum (trước khi chuyển sang PoS)"),
        bulletPoint("Các thợ đào (miner) cạnh tranh giải bài toán mật mã phức tạp"),
        bulletPoint("Người giải được đầu tiên có quyền tạo khối mới và nhận phần thưởng"),
        bulletPoint("Tiêu thụ nhiều năng lượng điện nhưng có độ bảo mật cao"),
        emptyLine(),
        p("Proof of Stake (PoS):", { bold: true }),
        bulletPoint("Được sử dụng bởi Ethereum 2.0, Cardano, Solana"),
        bulletPoint("Người xác nhận (validator) được chọn dựa trên số lượng token họ đặt cọc (stake)"),
        bulletPoint("Tiết kiệm năng lượng hơn PoW"),
        bulletPoint("Người xác nhận có động lực hành xử trung thực vì có tài sản đặt cọc"),
        emptyLine(),
        p("Các cơ chế khác: Delegated Proof of Stake (DPoS), Proof of Authority (PoA), Practical Byzantine Fault Tolerance (PBFT)..."),

        heading("2.1.5 Phân loại Blockchain", HeadingLevel.HEADING_3),
        createTable(
          ["Đặc điểm", "Public Blockchain", "Private Blockchain", "Consortium Blockchain"],
          [
            ["Quyền truy cập", "Công khai, ai cũng tham gia được", "Hạn chế, được cấp phép", "Hạn chế giữa các tổ chức"],
            ["Tốc độ", "Chậm", "Nhanh", "Trung bình"],
            ["Phi tập trung", "Cao", "Thấp", "Trung bình"],
            ["Ví dụ", "Bitcoin, Ethereum", "Hyperledger Fabric", "R3 Corda"],
          ]
        ),
        emptyLine(),
        p("Trong hệ thống máy bán hàng của chúng em, Ethereum (Public Testnet Sepolia) được lựa chọn vì:"),
        bulletPoint("Tính phi tập trung và minh bạch cao"),
        bulletPoint("Hỗ trợ smart contract mạnh mẽ"),
        bulletPoint("Hệ sinh thái phát triển phong phú (Ethers.js, Web3.js, web3dart)"),
        bulletPoint("Sepolia testnet cho phép thử nghiệm miễn phí với ETH ảo"),

        heading("2.2 Ethereum và Hợp đồng thông minh", HeadingLevel.HEADING_2),
        heading("2.2.1 Giới thiệu về Ethereum", HeadingLevel.HEADING_3),
        p("Ethereum là một nền tảng blockchain phi tập trung, mã nguồn mở, được Vitalik Buterin đề xuất vào năm 2013 và ra mắt vào năm 2015. Điểm khác biệt chính của Ethereum so với Bitcoin là khả năng thực thi Smart Contract (hợp đồng thông minh) trên Ethereum Virtual Machine (EVM)."),
        p("Ethereum sử dụng đồng tiền mã hóa riêng gọi là Ether (ETH). ETH được sử dụng để thanh toán phí giao dịch (gas fee), làm phần thưởng cho người xác nhận khối (validator), và làm phương tiện trao đổi giá trị trong các giao dịch."),
        p("Các mạng Ethereum phổ biến:"),
        bulletPoint("Mainnet: Mạng chính thức, sử dụng ETH thật"),
        bulletPoint("Sepolia: Mạng thử nghiệm chính thức (được sử dụng trong dự án này)"),
        bulletPoint("Goerli: Mạng thử nghiệm cũ (đã ngừng hỗ trợ)"),
        bulletPoint("Local: Mạng cục bộ (Ganache, Hardhat node)"),

        heading("2.2.2 Ethereum Virtual Machine (EVM)", HeadingLevel.HEADING_3),
        p("EVM là máy ảo Turing-complete chạy trên mỗi nút Ethereum. EVM thực thi bytecode của smart contract trong một môi trường cách ly (sandbox), đảm bảo rằng code chạy trên EVM không thể truy cập vào hệ thống tệp, mạng hoặc các tiến trình khác của nút."),
        p("Mỗi thao tác trong EVM tiêu tốn một lượng gas nhất định:"),
        bulletPoint("Gas: Đơn vị đo lường công sức tính toán cần thiết để thực hiện một thao tác"),
        bulletPoint("Gas Price: Giá của một đơn vị gas, tính bằng Gwei (1 Gwei = 10⁻⁹ ETH)"),
        bulletPoint("Gas Limit: Giới hạn gas tối đa người dùng sẵn sàng trả cho giao dịch"),
        bulletPoint("Tổng phí = Gas Used × Gas Price"),

        heading("2.2.3 Hợp đồng thông minh (Smart Contract)", HeadingLevel.HEADING_3),
        p("Smart Contract là các chương trình tự động thực thi được triển khai trên blockchain. Chúng hoạt động theo nguyên lý \"if-this-then-that\" (nếu-điều-kiện-thì-thực-hiện) và không thể bị can thiệp sau khi đã được triển khai."),
        p("Đặc điểm của Smart Contract:"),
        bulletPoint("Tự động thực thi: Không cần sự can thiệp của con người"),
        bulletPoint("Không thể thay đổi: Code không thể sửa đổi sau khi triển khai"),
        bulletPoint("Minh bạch: Mọi người đều có thể xem code và trạng thái"),
        bulletPoint("Xác định: Cùng một đầu vào luôn cho cùng một đầu ra"),
        emptyLine(),
        p("Trong hệ thống máy bán hàng, mặc dù không triển khai smart contract tùy chỉnh, nhưng backend hoạt động như một oracle - cầu nối giữa thế giới blockchain và thế giới thực. Backend theo dõi các giao dịch ETH gửi đến ví máy bán hàng, xác minh chúng, và kích hoạt quá trình phân phối sản phẩm vật lý. Mô hình này tương tự như cơ chế mà một smart contract sẽ thực hiện: kiểm tra điều kiện → ghi nhận giao dịch → thực thi hành động."),

        heading("2.2.4 Giao dịch Ethereum (Transaction)", HeadingLevel.HEADING_3),
        p("Một giao dịch Ethereum bao gồm các trường:"),
        createTable(
          ["Trường", "Mô tả"],
          [
            ["from", "Địa chỉ ví người gửi"],
            ["to", "Địa chỉ ví người nhận (hoặc địa chỉ smart contract)"],
            ["value", "Số lượng ETH gửi (tính bằng wei, 1 ETH = 10¹⁸ wei)"],
            ["gasLimit", "Giới hạn gas tối đa"],
            ["gasPrice", "Giá gas người gửi sẵn sàng trả"],
            ["nonce", "Số thứ tự giao dịch của người gửi"],
            ["data", "Dữ liệu kèm theo (dùng khi tương tác với smart contract)"],
            ["v, r, s", "Chữ ký số ECDSA xác nhận giao dịch"],
          ]
        ),

        heading("2.3 Xác thực phi tập trung Web3", HeadingLevel.HEADING_2),
        p("Web3 là thế hệ thứ ba của World Wide Web, dựa trên nền tảng blockchain. Web3 hướng đến một internet phi tập trung, nơi người dùng kiểm soát dữ liệu, danh tính và tài sản số của chính họ. Các đặc điểm chính bao gồm: sở hữu dữ liệu, danh tính tự chủ, thanh toán tích hợp bằng tiền mã hóa và không cần cấp phép tham gia."),
        p("Ví tiền mã hóa là công cụ cho phép người dùng quản lý khóa riêng (private key), khóa công khai (public key) và tương tác với blockchain. Trong đó, private key là một số 256-bit bí mật được sử dụng để ký giao dịch, public key được tạo từ private key bằng thuật toán ECDSA (secp256k1), và địa chỉ ví (address) được tạo từ public key bằng hàm băm Keccak-256."),
        p("Web3Auth là một giải pháp xác thực Web3 cho phép người dùng đăng nhập vào các ứng dụng phi tập trung (DApp) bằng các tài khoản mạng xã hội quen thuộc như Google. Cách thức hoạt động: người dùng đăng nhập bằng tài khoản Google, Web3Auth tạo hoặc khôi phục ví MPC (Multi-Party Computation), khóa riêng được chia thành nhiều phần (shares) phân phối cho thiết bị người dùng, Web3Auth Auth Network, và các yếu tố khôi phục. Khi cần ký giao dịch, các bên MPC cùng tính toán chữ ký mà không cần tái tạo khóa đầy đủ."),

        heading("2.4 Công nghệ Internet of Things (IoT)", HeadingLevel.HEADING_2),
        p("Internet of Things (IoT) là mạng lưới các thiết bị vật lý được nhúng với cảm biến, phần mềm và các công nghệ khác để kết nối và trao đổi dữ liệu với các thiết bị và hệ thống khác qua Internet. Một hệ thống IoT điển hình bao gồm 4 lớp: cảm biến/thiết bị, mạng, xử lý và ứng dụng."),
        p("ESP32 là một vi điều khiển (System-on-Chip) được phát triển bởi Espressif Systems, được sử dụng rộng rãi trong các ứng dụng IoT. Thông số chính: CPU Xtensa LX6 32-bit dual-core 240MHz, RAM 520KB SRAM, Flash 4MB, WiFi 802.11 b/g/n, Bluetooth v4.2, 34 chân GPIO, hỗ trợ SPI, I2C, I2S, UART."),

        heading("2.5 Tích hợp Blockchain và IoT", HeadingLevel.HEADING_2),
        p("Sự kết hợp giữa Blockchain và IoT (còn được gọi là BIoT - Blockchain IoT) mang lại nhiều lợi ích:"),
        bulletPoint("Tăng cường bảo mật: Blockchain cung cấp một lớp bảo mật bổ sung cho các thiết bị IoT"),
        bulletPoint("Minh bạch trong chuỗi cung ứng: Mọi sự kiện từ thiết bị IoT có thể được ghi lại trên blockchain"),
        bulletPoint("Thanh toán tự động: Thiết bị IoT có thể tự động thực hiện và nhận thanh toán thông qua smart contract"),
        bulletPoint("Xác thực thiết bị: Mỗi thiết bị IoT có thể có một danh tính trên blockchain"),
        bulletPoint("Chống gian lận dữ liệu: Dữ liệu từ cảm biến IoT được ghi trên blockchain không thể bị thay đổi"),
        emptyLine(),
        p("Tuy nhiên, việc tích hợp cũng đối mặt với các thách thức: hạn chế tài nguyên của thiết bị IoT, độ trễ giao dịch blockchain, chi phí gas, và khả năng mở rộng. Để giải quyết, hệ thống áp dụng kiến trúc lai (hybrid): ESP32 không tương tác trực tiếp với blockchain mà thông qua backend, backend hoạt động như oracle theo dõi blockchain và điều phối thiết bị IoT, giao dịch blockchain chỉ được sử dụng cho thanh toán, và sử dụng testnet Sepolia để loại bỏ chi phí thực."),

        // ── CHAPTER 3: SYSTEM ARCHITECTURE ──
        new Paragraph({ children: [new PageBreak()] }),
        heading("CHƯƠNG 3: KIẾN TRÚC HỆ THỐNG", HeadingLevel.HEADING_1),
        emptyLine(),
        heading("3.1 Tổng quan kiến trúc", HeadingLevel.HEADING_2),
        p("Hệ thống máy bán hàng tự động thông minh được thiết kế theo kiến trúc phân lớp (layered architecture) với 5 lớp chính:"),
        emptyLine(),
        numberedPoint(1, "Lớp ứng dụng di động (Mobile Layer): Flutter App — Web3Auth, Wallet Service, Queue/Purchase Screens"),
        numberedPoint(2, "Lớp Blockchain (Blockchain Layer): Ethereum Sepolia Testnet — ETH Transfer từ User Wallet đến Vending Wallet (0.001 ETH/sản phẩm)"),
        numberedPoint(3, "Lớp Backend (Backend Layer): Node.js/Express/Firebase Firestore — Auth, Queue Manager, Tx Verification, Command Service, Socket.io"),
        numberedPoint(4, "Lớp Firmware (Firmware Layer): ESP32/PlatformIO/C++ — WiFi AP+STA, TFT Display, Vending State Machine"),
        numberedPoint(5, "Lớp phần cứng (Hardware Layer): ESP32 + Ngoại vi — 4 Động cơ DC, 4 Cảm biến IR, Servo cửa, Buzzer, Màn hình TFT 240×320"),
        emptyLine(),
        p("Luồng hoạt động tổng quan:"),
        bulletPoint("Người dùng mở app Flutter → Đăng nhập Google qua Web3Auth → Nhận ví Ethereum"),
        bulletPoint("Backend xác thực người dùng qua chữ ký ví (EIP-191)"),
        bulletPoint("App sử dụng GPS tìm máy bán hàng gần nhất (bán kính 50m)"),
        bulletPoint("Người dùng tham gia hàng đợi → Nhận vị trí và thời gian chờ ước tính"),
        bulletPoint("Khi đến lượt (WebSocket turn_ready) → Chọn sản phẩm → Gửi ETH đến ví máy"),
        bulletPoint("Backend xác minh giao dịch trên Sepolia → Tạo lệnh phân phối"),
        bulletPoint("ESP32 poll lệnh → Kích hoạt động cơ → Cảm biến IR xác nhận sản phẩm rơi"),
        bulletPoint("ESP32 báo kết quả về backend → Backend thông báo cho người dùng qua WebSocket"),
        bulletPoint("Người dùng có thể mua tiếp hoặc kết thúc phiên → Phục vụ người tiếp theo"),

        heading("3.2 Lớp phần cứng (Hardware Layer)", HeadingLevel.HEADING_2),
        p("Hệ thống sử dụng board ESP32 DOIT DevKit V1 làm bộ não trung tâm, kết nối với các thành phần ngoại vi:"),
        createTable(
          ["Thành phần", "Model", "Giao tiếp", "Chức năng"],
          [
            ["Màn hình", "ST7789 240×320 TFT", "SPI (SCK:18, MOSI:23, RST:21, DC:22, CS:5)", "Hiển thị UI máy bán hàng"],
            ["Động cơ DC (×4)", "H-Bridge L9110S", "GPIO 16,17 / 25,26 / 27,14 / 12,13", "Đẩy sản phẩm ra khỏi khe"],
            ["Cảm biến IR (×5)", "TCRT5000", "ADC GPIO 32,33,34,35,39", "Phát hiện sản phẩm rơi"],
            ["Servo", "SG90", "LEDC GPIO 15", "Đóng/mở cửa lấy hàng"],
            ["Còi Buzzer", "Piezo", "LEDC GPIO 4", "Âm thanh thông báo"],
            ["GPS", "NEO-6M", "UART (RX:36, TX:37)", "Định vị máy (dự phòng)"],
          ]
        ),

        heading("3.3 Lớp Firmware (Firmware Layer)", HeadingLevel.HEADING_2),
        p("Firmware ESP32 được phát triển trên nền tảng PlatformIO sử dụng Arduino Framework và ngôn ngữ C++. Mã nguồn được tổ chức thành các module độc lập:"),
        bulletPoint("network/ — WiFi AP+STA, Captive DNS, WebServer"),
        bulletPoint("tft/ — Màn hình TFT với 6 màn hình UI (WIFI_SETUP, IDLE, SELECT, PROCESSING, SUCCESS, ERROR)"),
        bulletPoint("motor/ — Điều khiển 4 động cơ DC qua H-Bridge"),
        bulletPoint("buzzer/ — Còi buzzer PWM với các giai điệu startup, success, error"),
        bulletPoint("services/backend/ — Poll lệnh mỗi 2s, Heartbeat mỗi 10s"),
        bulletPoint("services/vending/ — Máy trạng thái phân phối sản phẩm"),
        bulletPoint("services/time/ — Đồng bộ thời gian NTP"),
        bulletPoint("services/weather/ — Dữ liệu thời tiết"),
        emptyLine(),
        p("ESP32 hoạt động đồng thời ở hai chế độ WiFi: AP Mode (tạo mạng WiFi riêng với SSID \"Vending_Setup\" cho cấu hình) và STA Mode (kết nối vào WiFi có sẵn để giao tiếp với backend)."),

        heading("3.4 Lớp Backend (Backend Layer)", HeadingLevel.HEADING_2),
        p("Backend được xây dựng trên Node.js với Express 5.x, sử dụng Firebase Firestore làm cơ sở dữ liệu NoSQL, Ethers.js v6 cho tương tác blockchain, và Socket.io cho giao tiếp thời gian thực."),
        p("Các API Endpoints chính:"),
        createTable(
          ["Nhóm", "Method", "Endpoint", "Mô tả"],
          [
            ["Auth", "GET", "/api/auth/nonce", "Lấy nonce cho wallet"],
            ["Auth", "POST", "/api/auth/login", "Đăng nhập bằng chữ ký ví"],
            ["Device", "POST", "/api/device/machine", "Đăng ký máy mới"],
            ["Device", "PUT", "/api/device/machine/:id", "Cập nhật trạng thái (heartbeat)"],
            ["Vending", "GET", "/api/vending", "Danh sách máy (lọc GPS)"],
            ["Vending", "POST", "/api/vending/:id/connect", "Tham gia hàng đợi"],
            ["Vending", "GET", "/api/vending/:id/queue/status", "Kiểm tra vị trí hàng đợi"],
            ["Vending", "POST", "/api/vending/:id/finish-shopping", "Kết thúc phiên mua"],
            ["Product", "POST", "/api/product/purchase", "Xác minh + tạo đơn hàng"],
            ["Command", "GET", "/api/command/machine/:id/pending", "ESP32 poll lệnh chờ"],
            ["Command", "PUT", "/api/command/machine/:id/command/:cmdId/status", "ESP32 báo kết quả"],
            ["Wallet", "GET", "/api/wallet/:address/balance", "Lấy số dư ETH"],
            ["Wallet", "GET", "/api/wallet/:address/history", "Lịch sử mua hàng"],
          ]
        ),

        heading("3.5 Lớp Blockchain (Blockchain Layer)", HeadingLevel.HEADING_2),
        p("Hệ thống sử dụng mô hình thanh toán trực tiếp (peer-to-peer) trên Ethereum Sepolia Testnet. Người dùng gửi 0.001 ETH đến ví máy bán hàng (0x94988621cDd1aCEAa0284f65cb2EBE0B40AD7c85). Backend sử dụng Ethers.js v6 để xác minh giao dịch với 5 bước: kiểm tra giao dịch tồn tại, kiểm tra Chain ID (11155111), kiểm tra địa chỉ nhận, kiểm tra số tiền (>= 0.001 ETH), và chờ xác nhận khối (tối đa 60 giây)."),
        p("Hệ thống áp dụng mô hình Oracle - một mẫu thiết kế phổ biến trong phát triển blockchain. Backend đóng vai trò oracle: theo dõi blockchain và kết nối với thế giới thực. Khi phát hiện giao dịch hợp lệ, backend kích hoạt thiết bị vật lý (ESP32). Mặc dù oracle là điểm tập trung, nhưng tính minh bạch được đảm bảo vì mọi giao dịch đều được ghi công khai trên blockchain."),

        heading("3.6 Lớp Ứng dụng Di động (Mobile Layer)", HeadingLevel.HEADING_2),
        p("Ứng dụng di động được phát triển bằng Flutter 3.x với ngôn ngữ Dart, sử dụng kiến trúc BLoC (Business Logic Component) cho quản lý trạng thái. Các thư viện chính: web3dart (tương tác Ethereum), Web3Auth Flutter SDK (đăng nhập Google → ví), socket_io_client (WebSocket), geolocator (GPS), connectivity_plus (kiểm tra kết nối)."),
        p("Các màn hình chính: Login (Web3Auth), Home (Dashboard với balance, lịch sử, máy gần nhất), Vending Machine List (danh sách máy theo GPS), Waiting Lobby (hàng đợi với WebSocket), Purchase (chọn sản phẩm, gửi ETH, theo dõi dispense)."),

        // ── CHAPTER 4: DETAILED DESIGN ──
        new Paragraph({ children: [new PageBreak()] }),
        heading("CHƯƠNG 4: THIẾT KẾ CHI TIẾT VÀ TRIỂN KHAI", HeadingLevel.HEADING_1),
        emptyLine(),
        heading("4.1 Cơ chế thanh toán qua Blockchain", HeadingLevel.HEADING_2),
        p("Trong hệ thống, Blockchain được sử dụng như một lớp xử lý thanh toán phi tập trung. Khi người dùng thực hiện giao dịch, hệ thống sẽ kiểm tra các điều kiện và ghi nhận thông tin giao dịch lên chuỗi khối. Mỗi giao dịch đều được lưu trữ công khai, không thể thay đổi, giúp đảm bảo tính minh bạch và chống gian lận."),
        emptyLine(),
        p("Quy trình xác minh giao dịch 5 bước:", { bold: true }),
        emptyLine(),
        p("Bước 1 - Lấy thông tin giao dịch từ blockchain:", { bold: true }),
        p("Backend sử dụng Ethers.js provider.getTransaction(txHash) để lấy thông tin giao dịch từ mạng Sepolia. Giao dịch phải tồn tại trên blockchain. Nếu không tìm thấy, có thể txHash không hợp lệ hoặc giao dịch chưa được phát tán."),
        emptyLine(),
        p("Bước 2 - Xác minh Chain ID:", { bold: true }),
        p("Đảm bảo giao dịch được thực hiện trên đúng mạng Sepolia (chain ID = 11155111). Điều này ngăn chặn tấn công replay attack từ các mạng khác."),
        emptyLine(),
        p("Bước 3 - Xác minh địa chỉ nhận:", { bold: true }),
        p("Đảm bảo ETH được gửi đến đúng ví của máy bán hàng (0x94988621cDd1aCEAa0284f65cb2EBE0B40AD7c85), không phải một địa chỉ khác."),
        emptyLine(),
        p("Bước 4 - Xác minh số tiền:", { bold: true }),
        p("Đảm bảo số ETH gửi đến >= giá sản phẩm (0.001 ETH). Sử dụng BigInt so sánh để tránh lỗi làm tròn số thực."),
        emptyLine(),
        p("Bước 5 - Đợi xác nhận giao dịch:", { bold: true }),
        p("Giao dịch Ethereum cần được khai thác (mined) vào một khối trước khi được coi là hoàn tất. Backend poll mỗi 3 giây trong tối đa 60 giây để đợi receipt. Nếu receipt.status === 0, giao dịch đã bị revert (thất bại)."),
        emptyLine(),
        p("Xử lý các trường hợp lỗi:", { bold: true }),
        createTable(
          ["Trường hợp", "Phát hiện", "Xử lý"],
          [
            ["txHash không tồn tại", "getTransaction trả về null", "Lỗi \"Transaction not found\""],
            ["Sai mạng (chain ID)", "tx.chainId !== 11155111", "Lỗi \"Wrong chain\""],
            ["Gửi sai địa chỉ", "tx.to !== VENDING_WALLET", "Lỗi \"Wrong recipient\""],
            ["Thiếu tiền", "tx.value < 0.001 ETH", "Lỗi \"Insufficient amount\""],
            ["Chưa xác nhận", "Không có receipt sau 60s", "Lỗi \"Not confirmed\""],
            ["Giao dịch revert", "receipt.status === 0", "Lỗi \"Transaction reverted\""],
          ]
        ),

        heading("4.2 Hệ thống quản lý hàng đợi", HeadingLevel.HEADING_2),
        p("Hệ thống sử dụng mô hình hàng đợi FIFO (First In, First Out) với cơ chế phân phối lượt tuần tự. Mỗi máy bán hàng có một hàng đợi riêng, được quản lý qua Firestore subcollection queues. Mỗi mục hàng đợi bao gồm: id, machineId, walletAddress, position, status (waiting/serving/completed/expired/cancelled), joinedAt, servingAt, expiresAt."),
        emptyLine(),
        p("Luồng quản lý hàng đợi:", { bold: true }),
        emptyLine(),
        p("Tham gia hàng đợi (connectToMachine):", { bold: true }),
        numberedPoint(1, "Kiểm tra máy tồn tại và đang online"),
        numberedPoint(2, "Tạo queue entry mới với trạng thái waiting"),
        numberedPoint(3, "Kiểm tra xem có ai đang được phục vụ không (serving)"),
        numberedPoint(4, "Nếu không có ai đang được phục vụ: tự động phục vụ người mới tham gia"),
        numberedPoint(5, "Nếu có người đang được phục vụ: gán vị trí = số người waiting + 1"),
        numberedPoint(6, "Trả về vị trí thực tế, số người phía trước, thời gian chờ ước tính"),
        emptyLine(),
        p("Phục vụ người tiếp theo (serveNext):", { bold: true }),
        numberedPoint(1, "Tìm người đầu tiên có trạng thái waiting, sắp xếp theo joinedAt"),
        numberedPoint(2, "Cập nhật trạng thái thành serving"),
        numberedPoint(3, "Gán servingAt = now, expiresAt = now + 120s"),
        numberedPoint(4, "Gửi thông báo WebSocket turn_ready đến người dùng"),
        emptyLine(),
        p("Tính năng chống race condition:", { bold: true }),
        p("Hệ thống áp dụng kiểm tra kép (Double-check): trước khi auto-serve, kiểm tra lại vị trí thực tế của người dùng. Khi mua hàng, xác minh người dùng là người đang được phục vụ. Nếu phiên đã hết hạn, từ chối giao dịch."),

        heading("4.3 Xác thực người dùng bằng ví Web3", HeadingLevel.HEADING_2),
        p("Hệ thống sử dụng cơ chế xác thực dựa trên ví Ethereum, tuân theo chuẩn EIP-191 (signed data). Luồng xác thực:"),
        numberedPoint(1, "Người dùng đăng nhập Google qua Web3Auth → Nhận ví Ethereum (MPC)"),
        numberedPoint(2, "App gọi GET /api/auth/nonce → Backend trả về nonce ngẫu nhiên"),
        numberedPoint(3, "App ký nonce bằng private key (EIP-191)"),
        numberedPoint(4, "App gọi POST /api/auth/login với address và signature"),
        numberedPoint(5, "Backend xác minh chữ ký bằng ethers.verifyMessage()"),
        numberedPoint(6, "Backend tạo/update user trong Firestore → Trả về JWT token"),
        numberedPoint(7, "App lưu JWT và sử dụng cho các API requests tiếp theo"),

        heading("4.4 Giao tiếp thời gian thực với WebSocket", HeadingLevel.HEADING_2),
        p("Hệ thống sử dụng Socket.io để cung cấp giao tiếp hai chiều thời gian thực. Các sự kiện chính:"),
        createTable(
          ["Sự kiện", "Hướng", "Mô tả"],
          [
            ["subscribe_machine", "Client→Server", "Đăng ký nhận thông báo cho máy"],
            ["turn_ready", "Server→Client", "Đến lượt người dùng"],
            ["turn_expired", "Server→Client", "Hết thời gian chờ (120s)"],
            ["queue_update", "Server→Client", "Cập nhật vị trí hàng đợi"],
            ["purchase_complete", "Server→Client", "Đơn hàng hoàn tất"],
          ]
        ),

        heading("4.5 Hệ thống điều khiển phần cứng ESP32", HeadingLevel.HEADING_2),
        p("ESP32 giao tiếp với backend qua hai cơ chế: Poll lệnh phân phối mỗi 2 giây (GET /api/command/machine/:id/pending) và Heartbeat cập nhật trạng thái mỗi 10 giây (PUT /api/device/machine/:id)."),
        emptyLine(),
        p("Máy trạng thái phân phối sản phẩm:", { bold: true }),
        p("READY → PROCESSING → (IR_DETECTED) → SUCCESS hoặc (TIMEOUT 3s) → ERROR. Khi có lệnh, ESP32 bật động cơ tương ứng, mở cửa lấy hàng, và đợi cảm biến IR phát hiện sản phẩm rơi. Nếu quá 3 giây không phát hiện, hệ thống báo lỗi Motor timeout."),

        heading("4.6 Cơ sở dữ liệu Firebase Firestore", HeadingLevel.HEADING_2),
        p("Hệ thống sử dụng Firestore với cấu trúc:"),
        bulletPoint("vending_machines (collection) → {machineId} → slots, queues, commands (subcollections)"),
        bulletPoint("orders (collection) → {orderId}: walletAddress, machineId, slot, priceETH, txHash, status, orderNumber"),
        bulletPoint("users (collection) → {walletAddress}: address, totalPurchases, totalSpentETH, lastLogin"),

        // ── CHAPTER 5: TESTING ──
        new Paragraph({ children: [new PageBreak()] }),
        heading("CHƯƠNG 5: KIỂM THỬ VÀ KẾT QUẢ", HeadingLevel.HEADING_1),
        emptyLine(),
        heading("5.1 Kịch bản kiểm thử", HeadingLevel.HEADING_2),
        p("Môi trường kiểm thử: mạng Ethereum Sepolia Testnet, backend Node.js localhost:3000, ESP32 DOIT DevKit V1 với đầy đủ ngoại vi, emulator Android hoặc thiết bị thật, ví test tạo qua Web3Auth faucet Sepolia."),
        emptyLine(),
        p("Các test case chính:"),
        createTable(
          ["TC#", "Module", "Test Case", "Kết quả mong đợi"],
          [
            ["TC01", "Auth", "Đăng nhập Google → Web3Auth", "Tạo ví Ethereum thành công"],
            ["TC02", "Auth", "Ký nonce → Backend xác minh", "Nhận JWT token"],
            ["TC03", "Vending", "Tìm máy theo GPS (bán kính 50m)", "Chỉ hiển thị máy trong bán kính"],
            ["TC04", "Queue", "Tham gia hàng đợi khi máy trống", "Được phục vụ ngay lập tức"],
            ["TC05", "Queue", "Tham gia khi có người đang dùng", "Xếp sau, hiển thị vị trí"],
            ["TC06", "Queue", "Hết thời gian chờ 120s", "Bị expire, phục vụ người tiếp"],
            ["TC07", "Blockchain", "Gửi đúng 0.001 ETH", "Backend xác minh thành công"],
            ["TC08", "Blockchain", "Gửi sai số tiền", "Từ chối \"Insufficient amount\""],
            ["TC09", "Blockchain", "Gửi đến sai địa chỉ", "Từ chối \"Wrong recipient\""],
            ["TC10", "Blockchain", "Gửi sai mạng", "Từ chối \"Wrong chain\""],
            ["TC11", "ESP32", "Poll lệnh phân phối", "Nhận lệnh và kích hoạt động cơ"],
            ["TC12", "ESP32", "IR phát hiện sản phẩm rơi", "Báo thành công về backend"],
            ["TC13", "ESP32", "Motor timeout 3s", "Báo lỗi \"Motor timeout\""],
            ["TC14", "Integration", "Luồng mua hàng hoàn chỉnh", "Tất cả các bước thành công"],
            ["TC15", "Integration", "Mua nhiều sản phẩm", "Các đơn hàng liên tiếp"],
          ]
        ),

        heading("5.2 Kết quả kiểm thử Blockchain", HeadingLevel.HEADING_2),
        p("Kết quả kiểm thử cho thấy backend xác minh giao dịch chính xác trong mọi trường hợp:"),
        bulletPoint("TC07 - Giao dịch hợp lệ: Xác minh thành công sau ~15-20 giây (1 block confirmation)"),
        bulletPoint("TC08 - Sai số tiền: Từ chối với thông báo \"Insufficient amount: expected 0.001 ETH, got 0.0005 ETH\""),
        bulletPoint("TC09 - Sai địa chỉ: Từ chối với thông báo \"Wrong recipient\""),
        bulletPoint("TC10 - Sai mạng: Từ chối với thông báo \"Wrong chain: expected 11155111, got 5\""),
        emptyLine(),
        p("Đo lường hiệu năng Blockchain:"),
        createTable(
          ["Chỉ số", "Giá trị", "Ghi chú"],
          [
            ["Thời gian xác nhận 1 block", "12-15 giây", "Sepolia PoS"],
            ["Thời gian backend poll receipt", "3-15 giây", "Poll mỗi 3s"],
            ["Tổng thời gian xác minh", "15-30 giây", "Từ lúc gửi tx đến confirm"],
            ["Phí gas trung bình", "~0.000021 ETH", "21,000 gas × ~1 Gwei"],
            ["Tỉ lệ xác minh thành công", "100%", "Với giao dịch hợp lệ"],
          ]
        ),

        heading("5.3 Kết quả kiểm thử IoT", HeadingLevel.HEADING_2),
        p("Tất cả các test case ESP32 đều đạt kết quả thành công:"),
        bulletPoint("Kết nối WiFi STA mode: ~3-5s"),
        bulletPoint("AP Mode: SSID \"Vending_Setup\" phát đều"),
        bulletPoint("Captive Portal: Tự động redirect về 192.168.4.1"),
        bulletPoint("Poll API (2s): Độ trễ trung bình 200-500ms"),
        bulletPoint("Heartbeat (10s): Gửi đều, không miss"),
        bulletPoint("Điều khiển Motor: 4 motor hoạt động độc lập"),
        bulletPoint("Cảm biến IR: Phát hiện sản phẩm rơi với độ chính xác >95%"),
        bulletPoint("Màn hình TFT: 6 màn hình UI hoạt động mượt"),
        bulletPoint("Servo cửa: Đóng/mở trong ~0.5s"),
        bulletPoint("Còi Buzzer: 3 giai điệu hoạt động tốt"),

        heading("5.4 Kết quả kiểm thử tích hợp", HeadingLevel.HEADING_2),
        p("Luồng mua hàng hoàn chỉnh được kiểm thử thành công với tổng thời gian ~20-30 giây (không tính thời gian chờ hàng đợi). Các bước chính: đăng nhập (3-5s), auth (0.5s), GPS (1-2s), tìm máy (0.3s), tham gia queue (0.2s), gửi ETH (1s), chờ confirm (12-20s), verify + tạo lệnh (0.2s), ESP32 poll + dispense (0-2s), motor + IR (1s), thông báo kết quả (0.1s)."),
        p("Mua nhiều sản phẩm trong một phiên (TC15) cũng hoạt động chính xác: mua sản phẩm 1 (slot A1) thành công, mua tiếp sản phẩm 2 (slot A2) không cần xếp hàng lại, kết thúc phiên → người tiếp theo được phục vụ."),

        heading("5.5 Đánh giá hệ thống", HeadingLevel.HEADING_2),
        p("Điểm mạnh:", { bold: true }),
        bulletPoint("Tích hợp thành công 3 công nghệ Blockchain, IoT và Mobile trong một hệ thống hoàn chỉnh"),
        bulletPoint("Thanh toán minh bạch: Mọi giao dịch được ghi công khai trên blockchain"),
        bulletPoint("Trải nghiệm người dùng liền mạch: Đăng nhập đơn giản qua Google"),
        bulletPoint("Hàng đợi thông minh: Quản lý công bằng, chống race condition, tự động timeout"),
        bulletPoint("Real-time updates qua WebSocket"),
        bulletPoint("Phần cứng hoàn chỉnh với đầy đủ cảm biến và cơ cấu chấp hành"),
        emptyLine(),
        p("Hạn chế:", { bold: true }),
        bulletPoint("Chưa có Smart Contract tùy chỉnh: Sử dụng raw ETH transfer"),
        bulletPoint("Phụ thuộc backend: Backend là điểm tập trung (oracle)"),
        bulletPoint("Độ trễ Blockchain: 12-20 giây chờ xác nhận giao dịch"),
        bulletPoint("Chỉ hỗ trợ ETH: Chưa hỗ trợ stablecoin hoặc ERC-20 tokens"),
        bulletPoint("Chưa có cơ chế chống trộm vật lý hoặc xác thực phần cứng"),

        // ── CHAPTER 6: CONCLUSION ──
        new Paragraph({ children: [new PageBreak()] }),
        heading("CHƯƠNG 6: KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN", HeadingLevel.HEADING_1),
        emptyLine(),
        heading("6.1 Kết quả đạt được", HeadingLevel.HEADING_2),
        p("Sau quá trình nghiên cứu và phát triển, nhóm đã xây dựng thành công Hệ thống máy bán hàng tự động thông minh tích hợp Blockchain và IoT với các kết quả cụ thể:"),
        emptyLine(),
        p("Về mặt Blockchain:", { bold: true }),
        bulletPoint("Tích hợp thành công mạng Ethereum Sepolia Testnet cho xử lý thanh toán"),
        bulletPoint("Xây dựng cơ chế xác minh giao dịch 5 bước, đảm bảo tính chính xác và bảo mật"),
        bulletPoint("Mỗi giao dịch được ghi nhận vĩnh viễn trên chuỗi khối, đảm bảo minh bạch và chống gian lận"),
        bulletPoint("Hỗ trợ xác thực người dùng bằng ví Web3 (EIP-191)"),
        emptyLine(),
        p("Về mặt IoT:", { bold: true }),
        bulletPoint("Phát triển firmware ESP32 hoàn chỉnh với kiến trúc module hóa"),
        bulletPoint("Điều khiển 4 khe sản phẩm độc lập với động cơ DC và cảm biến hồng ngoại"),
        bulletPoint("Màn hình TFT hiển thị 6 trạng thái giao diện khác nhau"),
        bulletPoint("Giao tiếp hai chiều với backend qua REST API (poll + heartbeat)"),
        bulletPoint("Hỗ trợ WiFi AP+STA đồng thời với captive portal cấu hình"),
        emptyLine(),
        p("Về mặt Mobile:", { bold: true }),
        bulletPoint("Ứng dụng Flutter đa nền tảng với giao diện thân thiện"),
        bulletPoint("Đăng nhập bằng Google thông qua Web3Auth, không yêu cầu kiến thức crypto"),
        bulletPoint("Tìm kiếm máy bán hàng gần nhất dựa trên GPS"),
        bulletPoint("Tham gia hàng đợi ảo và nhận thông báo thời gian thực qua WebSocket"),
        emptyLine(),
        p("Về mặt Backend:", { bold: true }),
        bulletPoint("REST API đầy đủ cho tất cả các chức năng của hệ thống"),
        bulletPoint("Hệ thống quản lý hàng đợi thông minh với cơ chế chống race condition"),
        bulletPoint("Giao tiếp thời gian thực qua Socket.io"),
        bulletPoint("CLI tool cho quản trị viên và tài liệu API tự động với Swagger"),

        heading("6.2 Hạn chế", HeadingLevel.HEADING_2),
        numberedPoint(1, "Chưa có Smart Contract tùy chỉnh: Hệ thống hiện sử dụng raw ETH transfer. Việc phát triển smart contract riêng sẽ cho phép tự động hóa logic nghiệp vụ, hỗ trợ nhiều loại thanh toán (ERC-20 tokens), cơ chế hoàn tiền tự động, và escrow thông minh."),
        numberedPoint(2, "Oracle tập trung: Backend là điểm tập trung duy nhất. Trong tương lai có thể sử dụng Chainlink Oracle hoặc mạng lưới oracle phi tập trung."),
        numberedPoint(3, "Phụ thuộc vào tốc độ Blockchain: Thời gian chờ xác nhận giao dịch 12-20 giây. Có thể sử dụng Layer 2 (Arbitrum, Optimism) hoặc sidechain (Polygon)."),
        numberedPoint(4, "Bảo mật thiết bị: ESP32 chưa có cơ chế xác thực phần cứng (HSM) hoặc Secure Element."),
        numberedPoint(5, "Khả năng mở rộng: Hệ thống hiện được thiết kế cho quy mô nhỏ."),

        heading("6.3 Hướng phát triển", HeadingLevel.HEADING_2),
        p("Ngắn hạn (1-3 tháng):", { bold: true }),
        numberedPoint(1, "Phát triển Smart Contract tùy chỉnh bằng Solidity để quản lý logic thanh toán, hỗ trợ mua nhiều sản phẩm, tích hợp refund tự động"),
        numberedPoint(2, "Hỗ trợ thanh toán đa dạng: USDC/USDT (stablecoin), các token ERC-20 phổ biến"),
        numberedPoint(3, "Cải thiện UX: Meta-transaction (gasless), lưu lịch sử chi tiết, đề xuất sản phẩm"),
        emptyLine(),
        p("Trung hạn (3-6 tháng):", { bold: true }),
        numberedPoint(4, "Tích hợp Layer 2: Arbitrum/Optimism để giảm phí gas và tăng tốc độ"),
        numberedPoint(5, "Phi tập trung hóa Oracle: Chainlink Functions, ESP32 lắng nghe sự kiện blockchain"),
        numberedPoint(6, "Mở rộng quy mô: Hỗ trợ nhiều máy, dashboard tập trung, phân tích dữ liệu"),
        emptyLine(),
        p("Dài hạn (6-12 tháng):", { bold: true }),
        numberedPoint(7, "Tokenomics: Utility token, cơ chế staking, loyalty program trên blockchain"),
        numberedPoint(8, "Bảo mật nâng cao: HSM cho ESP32, xác thực thiết bị qua blockchain"),
        numberedPoint(9, "Thương mại hóa: Chuyển sang Mainnet, tuân thủ pháp lý, mô hình kinh doanh"),
        numberedPoint(10, "Tích hợp AI: Dự đoán nhu cầu, dynamic pricing, phát hiện gian lận bằng ML"),

        heading("6.4 Bài học kinh nghiệm", HeadingLevel.HEADING_2),
        numberedPoint(1, "Blockchain không phải là \"viên đạn bạc\": Phù hợp cho bài toán minh bạch và chống gian lận, nhưng cần cân nhắc hiệu năng và chi phí. Kiến trúc lai là cách tiếp cận thực tế."),
        numberedPoint(2, "Thiết kế hệ thống phân tán là thách thức: Đồng bộ trạng thái giữa blockchain (chậm, bất biến), backend (nhanh, tập trung) và ESP32 (tài nguyên hạn chế) đòi hỏi thiết kế cẩn thận."),
        numberedPoint(3, "Trải nghiệm người dùng là then chốt: Web3Auth + Google login đã giúp ẩn đi sự phức tạp của blockchain, tạo trải nghiệm liền mạch."),
        numberedPoint(4, "Phát triển phần cứng đòi hỏi kiên nhẫn: Debug ESP32, motor, sensor tốn nhiều thời gian. Cần có thiết bị dự phòng."),
        numberedPoint(5, "Tài liệu và cộng đồng là nguồn lực quý giá: Ethers.js, Flutter, Arduino framework và cộng đồng đã hỗ trợ rất nhiều."),

        // ── REFERENCES ──
        new Paragraph({ children: [new PageBreak()] }),
        heading("TÀI LIỆU THAM KHẢO", HeadingLevel.HEADING_1),
        emptyLine(),
        p("[1] S. Shukla, M. Younas, et al., Blockchain Technology: From Theory to Practice. Springer, 2022."),
        p("[2] A. M. Antonopoulos and G. Wood, Mastering Ethereum: Building Smart Contracts and DApps. O'Reilly Media, 2018."),
        p("[3] I. Bashir, Mastering Blockchain, 3rd ed. Packt Publishing, 2020."),
        p("[4] V. Buterin, \"Ethereum: A Next-Generation Smart Contract and Decentralized Application Platform,\" 2014."),
        p("[5] S. Nakamoto, \"Bitcoin: A Peer-to-Peer Electronic Cash System,\" 2008."),
        p("[6] Ethereum Foundation, \"Ethereum Virtual Machine (EVM),\" ethereum.org, 2024."),
        p("[7] Ethereum Foundation, \"Sepolia Testnet,\" ethereum.org, 2024."),
        p("[8] Web3Auth, \"Web3Auth Documentation,\" web3auth.io, 2024."),
        p("[9] Espressif Systems, \"ESP32 Technical Reference Manual,\" espressif.com, 2024."),
        p("[10] Firebase, \"Cloud Firestore Documentation,\" firebase.google.com, 2024."),
        p("[11] Ethers.js, \"Ethers.js v6 Documentation,\" docs.ethers.org, 2024."),
        p("[12] Flutter, \"Flutter Documentation,\" flutter.dev, 2024."),
        p("[13] Socket.io, \"Socket.io Documentation,\" socket.io, 2024."),
        p("[14] PlatformIO, \"PlatformIO Documentation,\" platformio.org, 2024."),
        p("[15] Web3Dart, \"Web3Dart Documentation,\" pub.dev, 2024."),
        p("[16] K. Christidis and M. Devetsikiotis, \"Blockchains and Smart Contracts for the Internet of Things,\" IEEE Access, vol. 4, pp. 2292-2303, 2016."),
        p("[17] A. Reyna et al., \"On Blockchain and Its Integration with IoT,\" Future Generation Computer Systems, vol. 88, pp. 173-190, 2018."),
        p("[18] M. A. Khan and K. Salah, \"IoT Security: Review, Blockchain Solutions, and Open Challenges,\" Future Generation Computer Systems, vol. 82, pp. 395-411, 2018."),
        p("[19] T. M. Fernández-Caramés and P. Fraga-Lamas, \"A Review on the Use of Blockchain for the Internet of Things,\" IEEE Access, vol. 6, pp. 32979-33001, 2018."),
        p("[20] H. N. Dai, Z. Zheng, and Y. Zhang, \"Blockchain for Internet of Things: A Survey,\" IEEE Internet of Things Journal, vol. 6, no. 5, pp. 8076-8094, 2019."),
      ],
    },
  ],
});

// ── GENERATE FILE ──
const OUTPUT_PATH = "C:\\Users\\ADMIN\\My-project\\vending_machine\\BAO_CAO_BLOCKCHAIN_v2.docx";

console.log("⏳ Generating Word document...");
Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync(OUTPUT_PATH, buffer);
  console.log(`✅ Report saved to: ${OUTPUT_PATH}`);
  console.log(`📄 File size: ${(buffer.length / 1024).toFixed(1)} KB`);
}).catch((err) => {
  console.error("❌ Error:", err.message);
  process.exit(1);
});
