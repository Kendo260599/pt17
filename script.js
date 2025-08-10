// Phân tích ngày sinh
function parseDateParts(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') throw new Error('Ngày sinh không hợp lệ');
  const s = dateStr.trim();
  const sep = s.includes('-') ? '-' : (s.includes('/') ? '/' : null);
  if (!sep) throw new Error('Định dạng ngày phải có "-" hoặc "/" (vd 1992-03-13 hoặc 26/05/1992)');
  const parts = s.split(sep).map(x => parseInt(x, 10));
  if (parts.length !== 3 || parts.some(isNaN)) throw new Error('Định dạng ngày không đúng');
  if (parts[0] > 31) {
    return { year: parts[0], month: parts[1], day: parts[2] };
  } else {
    return { year: parts[2], month: parts[1], day: parts[0] };
  }
}

// Tính năm sinh hiệu lực (01/01 → 13/03 tính năm trước)
function getEffectiveBirthYear(birthDateString) {
  const { year, month, day } = parseDateParts(birthDateString);
  if (month < 3 || (month === 3 && day <= 13)) return year - 1;
  return year;
}

// Tính số Địa Chi (digital root)
function digitalRoot(year) {
  let sum = String(year).split('').reduce((a, b) => a + Number(b), 0);
  while (sum > 9) sum = String(sum).split('').reduce((a, b) => a + Number(b), 0);
  return sum === 0 ? 9 : sum;
}

// ================== CẬP NHẬT: TÍNH CUNG BÁT QUÁI THEO Quy tắc MỚI ==================
const cungToInfo = {
  'Khảm': { nguyenTo: 'Thủy', huong: 'Bắc' },
  'Ly': { nguyenTo: 'Hỏa', huong: 'Nam' },
  'Cấn': { nguyenTo: 'Mộc', huong: 'Đông Bắc' },
  'Đoài': { nguyenTo: 'Kim', huong: 'Tây Nam' },
  'Càn': { nguyenTo: 'Kim', huong: 'Đông' },
  'Khôn': { nguyenTo: 'Thổ', huong: 'Tây' },
  'Tốn': { nguyenTo: 'Mộc', huong: 'Đông Nam' },
  'Chấn': { nguyenTo: 'Thổ', huong: 'Bắc Tây' }
};

const mappingNam = {
  1: 'Khảm',
  2: 'Khôn',
  3: 'Chấn',
  4: 'Tốn',
  5: 'Khôn',
  6: 'Càn',
  7: 'Đoài',
  8: 'Cấn',
  9: 'Ly'
};

const mappingNu = {
  1: 'Khảm',
  2: 'Khôn',
  3: 'Chấn',
  4: 'Tốn',
  5: 'Cấn',
  6: 'Càn',
  7: 'Đoài',
  8: 'Cấn',
  9: 'Ly'
};

function getCungMenh(birthDateString, gender) {
  const effectiveYear = getEffectiveBirthYear(birthDateString);
  // Bước 1: Tính số địa chi (tổng chữ số năm sinh hiệu lực)
  let soTinh = digitalRoot(effectiveYear);
  // Bước 2: Cộng thêm 4
  soTinh += 4;
  // Bước 3: Nếu >9 → tính lại số địa chi
  if (soTinh > 9) {
    soTinh = digitalRoot(soTinh);
  }
  // Bước 4: Xử lý số 5
  if (soTinh === 5) {
    soTinh = (gender === 'nam') ? 2 : 8;
  }
  // Bước 5: Tra bảng cung theo giới tính
  const mapping = (gender === 'nam') ? mappingNam : mappingNu;
  const cung = mapping[soTinh];
  // Bước 6: Lấy thông tin nguyên tố & hướng
  const info = cungToInfo[cung] || { nguyenTo: 'Không xác định', huong: 'Không xác định' };
  // Xác định nhóm trạch
  const dongTu = ['Khảm', 'Ly', 'Chấn', 'Tốn'];
  const nhomTrach = dongTu.includes(cung) ? 'Đông Tứ Trạch' : 'Tây Tứ Trạch';
  // Trả về kết quả
  return {
    effectiveYear,
    soTinh, // Số sau khi tính toán
    cung,
    nhomTrach,
    nguyenTo: info.nguyenTo,
    huong: info.huong
  };
}
// ================== KẾT THÚC CẬP NHẬT CUNG BÁT QUÁI ==================

// Phân tích Bát Trạch (8 hướng tốt/xấu)
function getBatTrachForCung(cung) {
  const C = {
    good: {
      'Sinh Khí': { ten: 'Sinh Khí', loai: 'good', y: 'Tài lộc, danh tiếng, thăng tiến, vượng khí mạnh.' },
      'Thiên Y': { ten: 'Thiên Y', loai: 'good', y: 'Sức khỏe, trường thọ, quý nhân giúp đỡ.' },
      'Diên Niên': { ten: 'Diên Niên', loai: 'good', y: 'Hòa thuận, bền vững các mối quan hệ, gia đạo yên ổn.' },
      'Phục Vị': { ten: 'Phục Vị', loai: 'good', y: 'Ổn định, thi cử, phát triển bản thân, tinh thần.' }
    },
    bad: {
      'Tuyệt Mệnh': { ten: 'Tuyệt Mệnh', loai: 'bad', y: 'Nặng nhất: tổn hại lớn, bệnh tật, phá sản.' },
      'Ngũ Quỷ': { ten: 'Ngũ Quỷ', loai: 'bad', y: 'Thị phi, mất mát, tranh cãi, rối ren.' },
      'Lục Sát': { ten: 'Lục Sát', loai: 'bad', y: 'Kiện tụng, tai nạn, bất hòa, bất ổn kéo dài.' },
      'Họa Hại': { ten: 'Họa Hại', loai: 'bad', y: 'Xui xẻo, thất bại, thị phi nhỏ lẻ.' }
    }
  };

  const B = {
    'Khảm': {
      'Đông Nam': C.good['Sinh Khí'], 'Đông': C.good['Thiên Y'], 'Nam': C.good['Diên Niên'], 'Bắc': C.good['Phục Vị'],
      'Tây Nam': C.bad['Tuyệt Mệnh'], 'Đông Bắc': C.bad['Ngũ Quỷ'], 'Tây Bắc': C.bad['Lục Sát'], 'Tây': C.bad['Họa Hại']
    },
    'Ly': {
      'Đông': C.good['Sinh Khí'], 'Đông Nam': C.good['Thiên Y'], 'Bắc': C.good['Diên Niên'], 'Nam': C.good['Phục Vị'],
      'Tây Bắc': C.bad['Tuyệt Mệnh'], 'Tây': C.bad['Ngũ Quỷ'], 'Tây Nam': C.bad['Lục Sát'], 'Đông Bắc': C.bad['Họa Hại']
    },
    'Chấn': {
      'Nam': C.good['Sinh Khí'], 'Bắc': C.good['Thiên Y'], 'Đông Nam': C.good['Diên Niên'], 'Đông': C.good['Phục Vị'],
      'Tây': C.bad['Tuyệt Mệnh'], 'Tây Bắc': C.bad['Ngũ Quỷ'], 'Đông Bắc': C.bad['Lục Sát'], 'Tây Nam': C.bad['Họa Hại']
    },
    'Tốn': {
      'Bắc': C.good['Sinh Khí'], 'Nam': C.good['Thiên Y'], 'Đông': C.good['Diên Niên'], 'Đông Nam': C.good['Phục Vị'],
      'Đông Bắc': C.bad['Tuyệt Mệnh'], 'Tây Nam': C.bad['Ngũ Quỷ'], 'Tây': C.bad['Lục Sát'], 'Tây Bắc': C.bad['Họa Hại']
    },
    'Càn': {
      'Tây': C.good['Sinh Khí'], 'Đông Bắc': C.good['Thiên Y'], 'Tây Nam': C.good['Diên Niên'], 'Tây Bắc': C.good['Phục Vị'],
      'Nam': C.bad['Tuyệt Mệnh'], 'Đông': C.bad['Ngũ Quỷ'], 'Bắc': C.bad['Lục Sát'], 'Đông Nam': C.bad['Họa Hại']
    },
    'Khôn': {
      'Đông Bắc': C.good['Sinh Khí'], 'Tây': C.good['Thiên Y'], 'Tây Bắc': C.good['Diên Niên'], 'Tây Nam': C.good['Phục Vị'],
      'Bắc': C.bad['Tuyệt Mệnh'], 'Đông Nam': C.bad['Ngũ Quỷ'], 'Nam': C.bad['Lục Sát'], 'Đông': C.bad['Họa Hại']
    },
    'Cấn': {
      'Tây Nam': C.good['Sinh Khí'], 'Tây Bắc': C.good['Thiên Y'], 'Tây': C.good['Diên Niên'], 'Đông Bắc': C.good['Phục Vị'],
      'Đông Nam': C.bad['Tuyệt Mệnh'], 'Bắc': C.bad['Ngũ Quỷ'], 'Đông': C.bad['Lục Sát'], 'Nam': C.bad['Họa Hại']
    },
    'Đoài': {
      'Tây Bắc': C.good['Sinh Khí'], 'Tây Nam': C.good['Thiên Y'], 'Đông Bắc': C.good['Diên Niên'], 'Tây': C.good['Phục Vị'],
      'Đông': C.bad['Tuyệt Mệnh'], 'Nam': C.bad['Ngũ Quỷ'], 'Đông Nam': C.bad['Lục Sát'], 'Bắc': C.bad['Họa Hại']
    }
  };
  return B[cung];
}

function analyzeHouseDirection(cungMenh, huongNha) {
  const table = getBatTrachForCung(cungMenh.cung);
  const all = Object.entries(table).map(([huong, info]) => ({ huong, ...info }));
  const selected = table[huongNha];
  const goods = all.filter(x => x.loai === 'good');
  const bads = all.filter(x => x.loai === 'bad');
  return { selected, goods, bads, all };
}

function adviceForDirectionClass(cls) {
  if (!cls) return [];
  if (cls === 'good') {
    return [
      'Tận dụng hướng này cho cửa chính/ban công nếu có thể.',
      'Sắp xếp bếp, bàn thờ, giường, bàn làm việc quay về 1 trong 4 hướng tốt.',
      'Giữ lối vào thông thoáng, sạch sẽ để khí tốt dẫn vào nhà.'
    ];
  }
  return [
    'Ưu tiên xoay cửa, hiên/mái che, bậc tam cấp hoặc làm bình phong để “gãy dòng khí xấu”.',
    'Bếp, bàn thờ, giường, bàn làm việc quay về hướng tốt để “tọa hung – hướng cát”.',
    'Treo gương Bát Quái lồi ngoài cổng (cân nhắc/nhờ chuyên gia).',
    'Tăng cây xanh, ánh sáng, nước/đá trang trí để điều hòa khí.'
  ];
}

// 12 con giáp & Tam Tai
const ZODIAC = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];
function idxZodiac(year) { return ((year - 4) % 12 + 12) % 12; }
function nameZodiac(year) { return ZODIAC[idxZodiac(year)]; }
function nameByIndex(idx0) { return ZODIAC[idx0]; }

const TAM_TAI_GROUPS = [
  { group: ['Thân', 'Tý', 'Thìn'], tamTai: ['Dần', 'Mão', 'Thìn'] },
  { group: ['Dần', 'Ngọ', 'Tuất'], tamTai: ['Thân', 'Dậu', 'Tuất'] },
  { group: ['Hợi', 'Mão', 'Mùi'], tamTai: ['Tỵ', 'Ngọ', 'Mùi'] },
  { group: ['Tỵ', 'Dậu', 'Sửu'], tamTai: ['Hợi', 'Tý', 'Sửu'] }
];
function checkTamTai(ownerYear, constructionYear) {
  const ownerChi = nameZodiac(ownerYear);
  const cChi = nameZodiac(constructionYear);
  const group = TAM_TAI_GROUPS.find(g => g.group.includes(ownerChi));
  const isTamTai = group ? group.tamTai.includes(cChi) : false;
  return { isTamTai, ownerChi, constructionChi: cChi, tamTaiList: group ? group.tamTai : [] };
}

// Kim Lâu / Hoang Ốc / Xung tuổi
function tuoiMu(effectiveBirthYear, constructionYear) {
  return constructionYear - effectiveBirthYear + 1;
}
function checkKimLau(tuoiMuVal) {
  let r = tuoiMuVal % 9; if (r === 0) r = 9;
  const types = { 1: 'Kim Lâu Thân', 3: 'Kim Lâu Thê', 6: 'Kim Lâu Tử', 8: 'Kim Lâu Lục Súc' };
  const isKimLau = [1, 3, 6, 8].includes(r);
  return { isKimLau, type: isKimLau ? types[r] : null, remainder: r };
}
function checkHoangOc(tuoiMuVal) {
  const labels = ['Nhất Cát', 'Nhì Nghi', 'Tam Địa Sát', 'Tứ Tấn Tài', 'Ngũ Thọ Tử', 'Lục Hoang Ốc'];
  const m = tuoiMuVal % 6; const idx = (m === 0) ? 5 : m - 1;
  const name = labels[idx];
  const isBad = ['Tam Địa Sát', 'Ngũ Thọ Tử', 'Lục Hoang Ốc'].includes(name);
  return { name, isBad };
}
function checkXungTuoi(ownerYear, constructionYear) {
  const oppIdx = (idxZodiac(ownerYear) + 6) % 12;
  const isXung = idxZodiac(constructionYear) === oppIdx;
  return { isXung, ownerChi: nameZodiac(ownerYear), constructionChi: nameZodiac(constructionYear), oppositeChi: nameByIndex(oppIdx) };
}

// Ngũ hành năm/tháng & xung khắc
function elementYear(year) {
  const s = ((year - 4) % 10 + 10) % 10;
  if (s === 0 || s === 1) return 'Mộc';
  if (s === 2 || s === 3) return 'Hỏa';
  if (s === 4 || s === 5) return 'Thổ';
  if (s === 6 || s === 7) return 'Kim';
  return 'Thủy';
}
function elementMonth(month) {
  const m = Number(month);
  if ([1, 6, 11].includes(m)) return 'Thủy';
  if ([2, 7, 12].includes(m)) return 'Hỏa';
  if ([3, 8].includes(m)) return 'Thổ';
  if ([4, 9].includes(m)) return 'Kim';
  if ([5, 10].includes(m)) return 'Mộc';
  return null;
}
const KHAC = { 'Mộc': 'Thổ', 'Thổ': 'Thủy', 'Thủy': 'Hỏa', 'Hỏa': 'Kim', 'Kim': 'Mộc' };
function isElementConflict(e1, e2) {
  if (!e1 || !e2) return false;
  return (KHAC[e1] === e2) || (KHAC[e2] === e1);
}

// Yếu tố xấu BĐS & hóa giải
function checkSiteIssues(features) {
  const problems = []; const solutions = [];

  if (features.includes('benh-vien')) {
    problems.push('Trước mặt Bệnh viện: âm khí nặng, ảnh hưởng trường khí và sức khỏe.');
    solutions.push('Hóa giải: tăng cây xanh, rèm dày, đèn sáng; treo gương Bát Quái lồi ngoài cổng (cân nhắc), đặt tượng Di Lặc để tăng dương khí.');
  }
  if (features.includes('chua') || features.includes('nha-tho')) {
    problems.push('Đối diện Chùa/Nhà thờ: khí tĩnh/âm mạnh, dễ ảnh hưởng tài khí.');
    solutions.push('Hóa giải: đặt Quan Công gần cửa, chuông gió kim loại, cây Kim Ngân/Trầu bà, hạn chế nhìn thẳng vào cơ sở tâm linh.');
  }
  if (features.includes('truong-hoc')) {
    problems.push('Đối diện Trường học: ồn ào, khí động mạnh, ảnh hưởng nghỉ ngơi.');
    solutions.push('Hóa giải: làm hàng rào, vách ngăn, rèm cách âm; bố trí phòng ngủ lùi sâu; tăng cây xanh.');
  }
  if (features.includes('duong-dam')) {
    problems.push('Đường đâm thẳng vào nhà: sát khí trực xung, hao tài tổn khí.');
    solutions.push('Hóa giải: bình phong/tiểu cảnh trước cửa, trồng cây to, bậc tam cấp gãy dòng; gương Bát Quái lồi ngoài cổng (cân nhắc).');
  }
  if (features.includes('nga-ba') || features.includes('nga-tu')) {
    problems.push('Nhà tại Ngã ba/ngã tư: khí loạn, bất ổn, khó tụ tài.');
    solutions.push('Hóa giải: hàng rào/cổng kín, hồ cá/đá/đèn cân bằng, sảnh/hiên che chắn; bố trí cửa phụ thay cho cửa chính nếu cần.');
  }
  if (features.includes('duong-doc')) {
    problems.push('Đường dốc trước nhà: khí trượt, khó tụ tài.');
    solutions.push('Hóa giải: bậc thềm, ốp đá nhám, bồn cây bậc cấp làm “phanh” khí; ưu tiên cửa lệch, bình phong.');
  }
  if (features.includes('cot-dien')) {
    problems.push('Cột điện gần nhà/cổng: sát khí, từ trường xấu, ảnh hưởng sức khỏe.');
    solutions.push('Hóa giải: lùi cổng/cửa chính, trồng cây cao làm che chắn, bố trí đá hộ mệnh (thạch anh), không đặt giường gần tường sát cột.');
  }
  return { problems, solutions };
}

// Tổng hợp đánh giá
function evaluateBuildTime(birthDate, gender, constructionYear, constructionMonth) {
  const cung = getCungMenh(birthDate, gender);
  const ageMu = tuoiMu(cung.effectiveYear, constructionYear);

  const kimLau = checkKimLau(ageMu);
  const hoangOc = checkHoangOc(ageMu);
  const tamTai = checkTamTai(cung.effectiveYear, constructionYear);
  const xung = checkXungTuoi(cung.effectiveYear, constructionYear);

  const yElem = elementYear(constructionYear);
  const mElem = elementMonth(constructionMonth);
  const conflictYear = isElementConflict(cung.nguyenTo, yElem);
  const conflictMonth = isElementConflict(cung.nguyenTo, mElem);

  const yearWarnings = [];
  if (kimLau.isKimLau) yearWarnings.push(`Phạm Kim Lâu (${kimLau.type}) — tuổi mụ ${ageMu}.`);
  if (hoangOc.isBad) yearWarnings.push(`Phạm Hoang Ốc (${hoangOc.name}).`);
  if (tamTai.isTamTai) yearWarnings.push(`Phạm Tam Tai (${tamTai.constructionChi}); chu kỳ Tam Tai của bạn: ${tamTai.tamTaiList.join(', ')}.`);
  if (xung.isXung) yearWarnings.push(`Xung tuổi với năm ${constructionYear} (năm ${xung.constructionChi} đối xung ${xung.oppositeChi}).`);
  if (conflictYear) yearWarnings.push(`Ngũ hành Cung (${cung.nguyenTo}) khắc Ngũ hành Năm (${yElem}).`);

  const monthWarnings = [];
  if (conflictMonth) monthWarnings.push(`Tháng ${constructionMonth}: Cung (${cung.nguyenTo}) khắc tháng (${mElem}).`);

  return {
    cung,
    ageMu,
    kimLau, hoangOc, tamTai, xung,
    yearElement: yElem, monthElement: mElem,
    yearWarnings, monthWarnings,
    isYearGood: yearWarnings.length === 0,
    isMonthGood: monthWarnings.length === 0
  };
}

function evaluateAll(birthDate, gender, huongNha, constructionYear, constructionMonth, features) {
  const build = evaluateBuildTime(birthDate, gender, constructionYear, constructionMonth);
  const dir = analyzeHouseDirection(build.cung, huongNha);
  const site = checkSiteIssues(features);
  return { build, dir, site };
}

// Hook với UI
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('btn-analyze');
  if (!btn) return;

  btn.addEventListener('click', () => {
    try {
      const birth = document.getElementById('ngay-sinh').value.trim();
      const gender = document.getElementById('gioi-tinh').value;
      const huongNha = document.getElementById('huong-nha').value;
      const yearX = parseInt(document.getElementById('nam-xay').value, 10);
      const monthX = parseInt(document.getElementById('thang-xay').value, 10);
      const features = Array.from(document.querySelectorAll('input[name="location-feature"]:checked')).map(c => c.value);

      if (!birth) return alert('Vui lòng nhập ngày sinh (YYYY-MM-DD hoặc DD/MM/YYYY).');
      if (!yearX || yearX < 1900 || yearX > 2099) return alert('Vui lòng nhập năm xây hợp lệ (1900–2099).');
      if (!monthX || monthX < 1 || monthX > 12) return alert('Vui lòng chọn tháng xây (1–12).');

      const R = evaluateAll(birth, gender, huongNha, yearX, monthX, features);
      const r = document.getElementById('result-content');
      let html = '';

      // Tóm tắt cung mệnh
      html += `<div class="ket-luan">`;
      html += `<div><span class="badge">Cung mệnh</span> <strong>${R.build.cung.cung}</strong> — Ngũ hành: <strong>${R.build.cung.nguyenTo}</strong> — Nhóm: <strong>${R.build.cung.nhomTrach}</strong></div>`;
      html += `<div class="block-sub">Năm sinh hiệu lực: ${R.build.cung.effectiveYear} — Số tính: ${R.build.cung.soTinh}</div>`;
      html += `</div>`;

      // Hướng nhà
      const sel = R.dir.selected;
      html += `<h3 class="block-title">Hướng nhà: ${huongNha} <span class="tag ${sel?.loai || 'warn'}">${sel ? sel.ten : '?'}</span></h3>`;
      if (sel) {
        html += `<p><em>Ý nghĩa:</em> ${sel.y}</p>`;
        const adv = adviceForDirectionClass(sel.loai);
        if (adv.length) {
          html += `<p><strong>Gợi ý:</strong></p><ul class="clean">`;
          adv.forEach(a => html += `<li>${a}</li>`);
          html += `</ul>`;
        }
      }
      if (R.dir.goods?.length) {
        html += `<p><strong>4 hướng tốt nên ưu tiên:</strong></p><ul class="clean">`;
        const priority = { 'Sinh Khí': 1, 'Thiên Y': 2, 'Diên Niên': 3, 'Phục Vị': 4 };
        const gsort = [...R.dir.goods].sort((a, b) => (priority[a.ten] || 9) - (priority[b.ten] || 9));
        gsort.forEach(g => html += `<li><span class="good">${g.huong}</span> — ${g.ten}: ${g.y}</li>`);
        html += `</ul>`;
      }

      html += `<hr/>`;

      // Năm / Tháng xây
      html += `<h3 class="block-title">Năm/Tháng xây</h3>`;
      html += `<p>Tuổi mụ: <strong>${R.build.ageMu}</strong> — Ngũ hành năm: <strong>${R.build.yearElement}</strong> — Ngũ hành tháng: <strong>${R.build.monthElement || '?'}</strong></p>`;
      if (R.build.yearWarnings.length === 0) html += `<p class="good">Năm ${yearX}: Không thấy cảnh báo lớn.</p>`;
      else {
        html += `<p><strong>Cảnh báo năm ${yearX}:</strong></p><ul class="clean">`;
        R.build.yearWarnings.forEach(w => html += `<li class="bad">${w}</li>`);
        html += `</ul>`;
      }
      if (R.build.monthWarnings.length === 0) html += `<p class="good">Tháng ${monthX}: Không thấy cảnh báo lớn.</p>`;
      else {
        html += `<p><strong>Cảnh báo tháng ${monthX}:</strong></p><ul class="clean">`;
        R.build.monthWarnings.forEach(w => html += `<li class="warn">${w}</li>`);
        html += `</ul>`;
      }

      html += `<hr/>`;

      // Yếu tố bất động sản
      html += `<h3 class="block-title">Môi trường xung quanh BĐS</h3>`;
      if (R.site.problems.length === 0) {
        html += `<p class="good">Không phát hiện yếu tố xấu đã chọn.</p>`;
      } else {
        html += `<p><strong>Vấn đề:</strong></p><ul class="clean">`;
        R.site.problems.forEach(p => html += `<li class="bad">${p}</li>`);
        html += `</ul>`;
        html += `<p><strong>Hóa giải gợi ý:</strong></p><ul class="clean">`;
        R.site.solutions.forEach(s => html += `<li>${s}</li>`);
        html += `</ul>`;
      }

      r.innerHTML = html;

    } catch (err) {
      console.error(err);
      alert('Lỗi: ' + (err.message || err));
    }
  });
});