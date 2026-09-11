import { useState } from 'react'
import { Settings, X, Copy, Download, Trash2, Clock, Phone, Palette, Check, Sparkles } from 'lucide-react'
import { deduplicateRsvps } from '../services/api'
import { THEMES, applyTheme } from '../services/themes'

export default function HostSettingsDrawer({
  isOpen,
  onClose,
  hostData,
  onUpdateHostData,
  rsvpList = [],
  onDeleteRsvp,
  onTriggerConfetti
}) {
  const [activeTab, setActiveTab] = useState('settings') // 'settings' | 'themes' | 'link' | 'guests'
  const [friendName, setFriendName] = useState('')
  const [linkTheme, setLinkTheme] = useState(hostData.theme || 'gold')
  const [copiedLink, setCopiedLink] = useState('')
  const [formData, setFormData] = useState({ ...hostData })

  if (!isOpen) return null

  const safeRsvpList = deduplicateRsvps(rsvpList)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectTheme = (themeId) => {
    setFormData(prev => ({ ...prev, theme: themeId }))
    applyTheme(themeId)
    onUpdateHostData({ ...formData, theme: themeId })
    if (onTriggerConfetti) onTriggerConfetti()
  }

  const handleSaveSettings = (e) => {
    e.preventDefault()
    onUpdateHostData(formData)
    if (onTriggerConfetti) onTriggerConfetti()
    alert('Đã cập nhật thông tin Lễ Tốt Nghiệp thành công!')
  }

  const handleGenerateGuestLink = () => {
    if (!friendName.trim()) return
    const themeParam = linkTheme ? `&theme=${encodeURIComponent(linkTheme)}` : ''
    const generatedUrl = `${window.location.origin}${window.location.pathname}?guest=${encodeURIComponent(friendName.trim())}${themeParam}`
    navigator.clipboard.writeText(generatedUrl)
    setCopiedLink(generatedUrl)
    if (onTriggerConfetti) onTriggerConfetti()
  }

  const handleExportGuests = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(safeRsvpList, null, 2))
    const downloadAnchor = document.createElement('a')
    downloadAnchor.setAttribute("href", dataStr)
    downloadAnchor.setAttribute("download", `Danh_Sach_RSVP_Tot_Nghiep_${hostData.graduateName || 'Cu_Nhan'}.json`)
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-surface-container-low h-full overflow-y-auto p-card-padding-mobile flex flex-col justify-between border-l border-primary/30 shadow-2xl">
        
        {/* Header */}
        <div className="flex flex-col gap-space-sm border-b border-outline-variant/30 pb-space-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-space-xs">
              <Settings className="w-6 h-6 text-primary" />
              <h3 className="font-headline-md text-headline-md text-on-surface">
                Bảng Cài Đặt Cho Cử Nhân
              </h3>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface hover:text-primary transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs (4 columns) */}
          <div className="grid grid-cols-4 gap-1 bg-surface-container-lowest p-1 rounded-xl text-center">
            <button
              onClick={() => setActiveTab('settings')}
              className={`py-1.5 px-1 font-button-text text-[11px] rounded-lg transition-all ${
                activeTab === 'settings'
                  ? 'bg-primary-container text-on-primary-container font-bold shadow'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Cài Đặt
            </button>
            <button
              onClick={() => setActiveTab('themes')}
              className={`py-1.5 px-1 font-button-text text-[11px] rounded-lg transition-all flex items-center justify-center gap-1 ${
                activeTab === 'themes'
                  ? 'bg-primary-container text-on-primary-container font-bold shadow'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <Palette className="w-3 h-3" />
              Màu Sắc
            </button>
            <button
              onClick={() => setActiveTab('link')}
              className={`py-1.5 px-1 font-button-text text-[11px] rounded-lg transition-all ${
                activeTab === 'link'
                  ? 'bg-primary-container text-on-primary-container font-bold shadow'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Tạo Link
            </button>
            <button
              onClick={() => setActiveTab('guests')}
              className={`py-1.5 px-1 font-button-text text-[11px] rounded-lg transition-all ${
                activeTab === 'guests'
                  ? 'bg-primary-container text-on-primary-container font-bold shadow'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              RSVP ({safeRsvpList.length})
            </button>
          </div>
        </div>

        {/* Tab 1: Cài đặt thông tin */}
        {activeTab === 'settings' && (
          <form onSubmit={handleSaveSettings} className="space-y-space-md py-space-md flex-1">
            <div>
              <label className="font-label-caps text-[10px] uppercase text-on-surface-variant block mb-1">
                Tên Tân Cử Nhân
              </label>
              <input
                type="text"
                name="graduateName"
                value={formData.graduateName}
                onChange={handleChange}
                className="w-full px-space-md py-space-xs bg-surface-container-highest rounded-lg text-on-surface font-body-md"
                required
              />
            </div>

            <div>
              <label className="font-label-caps text-[10px] uppercase text-on-surface-variant block mb-1">
                Ngành Học & Trường / Khoa
              </label>
              <input
                type="text"
                name="degree"
                value={formData.degree}
                onChange={handleChange}
                className="w-full px-space-md py-space-xs bg-surface-container-highest rounded-lg text-on-surface font-body-md"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-space-xs">
              <div>
                <label className="font-label-caps text-[10px] uppercase text-on-surface-variant block mb-1">
                  Ngày & Giờ Check-in
                </label>
                <input
                  type="text"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full px-space-md py-space-xs bg-surface-container-highest rounded-lg text-on-surface font-body-md"
                  required
                />
              </div>
              <div>
                <label className="font-label-caps text-[10px] uppercase text-on-surface-variant block mb-1">
                  Dress Code
                </label>
                <input
                  type="text"
                  name="dressCode"
                  value={formData.dressCode}
                  onChange={handleChange}
                  className="w-full px-space-md py-space-xs bg-surface-container-highest rounded-lg text-on-surface font-body-md"
                  required
                />
              </div>
            </div>

            <div>
              <label className="font-label-caps text-[10px] uppercase text-on-surface-variant block mb-1">
                Địa Điểm Đón Tiếp
              </label>
              <input
                type="text"
                name="venue"
                value={formData.venue}
                onChange={handleChange}
                className="w-full px-space-md py-space-xs bg-surface-container-highest rounded-lg text-on-surface font-body-md"
                required
              />
            </div>

            <div>
              <label className="font-label-caps text-[10px] uppercase text-on-surface-variant block mb-1">
                Ảnh Chân Dụng Tốt Nghiệp (Tải ảnh lên hoặc dán Link)
              </label>
              
              {/* Image Preview & Upload options */}
              <div className="flex items-center gap-space-sm mb-space-xs">
                {formData.avatarUrl && (
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary/60 shrink-0 shadow-md">
                    <img src={formData.avatarUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex flex-col gap-1 flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        const reader = new FileReader()
                        reader.onload = (evt) => {
                          setFormData(prev => ({ ...prev, avatarUrl: evt.target.result }))
                        }
                        reader.readAsDataURL(file)
                      }
                    }}
                    className="text-xs text-on-surface-variant file:mr-2 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary/20 file:text-primary hover:file:bg-primary/30 cursor-pointer"
                  />
                  <span className="font-body-sm text-[10px] text-outline">
                    (Chọn tệp ảnh từ máy tính để tự động đính ảnh)
                  </span>
                </div>
              </div>

              <input
                type="text"
                name="avatarUrl"
                value={formData.avatarUrl}
                onChange={handleChange}
                placeholder="Hoặc dán URL ảnh trực tuyến..."
                className="w-full px-space-md py-space-xs bg-surface-container-highest rounded-lg text-on-surface font-body-md text-xs"
              />
            </div>

            <div>
              <label className="font-label-caps text-[10px] uppercase text-on-surface-variant block mb-1">
                Lời Tâm Tình Gửi Hội Bạn Thân
              </label>
              <textarea
                name="quote"
                rows={2}
                value={formData.quote}
                onChange={handleChange}
                className="w-full px-space-md py-space-xs bg-surface-container-highest rounded-lg text-on-surface font-body-md"
              />
            </div>

            {/* Thông tin liên hệ (SĐT, Zalo, Facebook) */}
            <div className="p-3 bg-surface-container-lowest/80 rounded-xl border border-primary/30 space-y-2.5">
              <span className="font-label-caps text-[10px] uppercase text-primary font-bold block">
                📞 Thông Tin Liên Hệ Của Bạn (Hiển thị góc màn hình)
              </span>

              <div>
                <label className="font-label-caps text-[10px] uppercase text-on-surface-variant block mb-1">
                  Số Điện Thoại
                </label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone || ''}
                  onChange={handleChange}
                  placeholder="Ví dụ: 0901234567"
                  className="w-full px-space-md py-space-xs bg-surface-container-highest rounded-lg text-on-surface font-body-md text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-space-xs">
                <div>
                  <label className="font-label-caps text-[10px] uppercase text-on-surface-variant block mb-1">
                    Link Zalo (hoặc để trống dùng SĐT)
                  </label>
                  <input
                    type="text"
                    name="zaloUrl"
                    value={formData.zaloUrl || ''}
                    onChange={handleChange}
                    placeholder="https://zalo.me/..."
                    className="w-full px-space-md py-space-xs bg-surface-container-highest rounded-lg text-on-surface font-body-md text-xs"
                  />
                </div>

                <div>
                  <label className="font-label-caps text-[10px] uppercase text-on-surface-variant block mb-1">
                    Link Facebook cá nhân
                  </label>
                  <input
                    type="text"
                    name="facebookUrl"
                    value={formData.facebookUrl || ''}
                    onChange={handleChange}
                    placeholder="https://facebook.com/..."
                    className="w-full px-space-md py-space-xs bg-surface-container-highest rounded-lg text-on-surface font-body-md text-xs"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-space-sm bg-primary text-on-primary font-button-text text-button-text rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.01] transition-transform"
            >
              Lưu Thay Đổi Thông Tin Thiệp 🎓
            </button>
          </form>
        )}

        {/* Tab 2: Bộ Sưu Tập Màu Sắc Giao Diện */}
        {activeTab === 'themes' && (
          <div className="py-space-md flex-1 space-y-space-md">
            <div className="bg-surface-container p-space-md rounded-xl border border-primary/30">
              <div className="flex items-center gap-2 mb-1">
                <Palette className="w-4 h-4 text-primary" />
                <h4 className="font-subheading-serif text-on-surface font-bold text-sm">
                  Bộ Sưu Tập Màu Sắc Giao Diện
                </h4>
              </div>
              <p className="font-body-sm text-[12px] text-on-surface-variant leading-relaxed">
                Chọn tông màu chủ đạo cho thiệp mời. Hiệu ứng ánh sáng, thẻ VIP và toàn bộ trang sẽ biến đổi đồng bộ theo màu bạn chọn!
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
              {THEMES.map((theme) => {
                const isSelected = (formData.theme || 'gold') === theme.id
                return (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => handleSelectTheme(theme.id)}
                    className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col justify-between gap-2.5 cursor-pointer group ${
                      isSelected
                        ? 'bg-surface-container-high border-primary shadow-lg shadow-primary/20 scale-[1.02]'
                        : 'bg-surface-container border-outline-variant/30 hover:border-primary/50 hover:bg-surface-container-high'
                    }`}
                  >
                    {/* Top Color Dots Header */}
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-4 h-4 rounded-full border border-white/30 shadow-sm transition-transform group-hover:scale-110"
                          style={{ backgroundColor: theme.primaryColor }}
                        ></span>
                        <span
                          className="w-4 h-4 rounded-full border border-white/30 shadow-sm -ml-2 transition-transform group-hover:scale-110"
                          style={{ backgroundColor: theme.accentColor }}
                        ></span>
                        <span
                          className="w-4 h-4 rounded-full border border-white/30 shadow-sm -ml-2 transition-transform group-hover:scale-110"
                          style={{ backgroundColor: theme.bgHex }}
                        ></span>
                      </div>
                      {isSelected ? (
                        <span className="px-2 py-0.5 rounded-full bg-primary text-on-primary font-label-caps text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-sm">
                          <Check className="w-3 h-3" /> Đang Dùng
                        </span>
                      ) : (
                        <span className="text-[10px] text-outline font-label-caps uppercase group-hover:text-primary transition-colors">
                          Chọn
                        </span>
                      )}
                    </div>

                    {/* Theme Name & Tag */}
                    <div>
                      <div className="font-subheading-serif font-bold text-sm text-on-surface flex items-center gap-1.5">
                        {theme.name}
                      </div>
                      <span className="text-[11px] text-outline block mt-0.5">
                        {theme.tag}
                      </span>
                    </div>

                    {/* Gradient Line Indicator */}
                    <div className={`h-1.5 w-full rounded-full bg-gradient-to-r ${theme.gradientClass}`}></div>
                  </button>
                )
              })}
            </div>

            <div className="p-space-xs bg-surface-container-lowest rounded-xl border border-outline-variant/30 text-center">
              <span className="font-body-sm text-[11px] text-primary flex items-center justify-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                Màu sắc sẽ tự động lưu và áp dụng trực tiếp cho tất cả bạn bè khi mở thiệp!
              </span>
            </div>
          </div>
        )}

        {/* Tab 3: Tạo Link Cá Nhân Hóa */}
        {activeTab === 'link' && (
          <div className="py-space-md flex-1 space-y-space-md">
            <div className="bg-surface-container p-space-md rounded-xl border border-primary/30">
              <h4 className="font-subheading-serif text-on-surface font-bold mb-1">
                Tạo Đường Link Thiệp Riêng Cho Từng Bạn
              </h4>
              <p className="font-body-sm text-[12px] text-on-surface-variant leading-relaxed">
                Nhập tên bạn bè và chọn tông màu riêng cho bạn ấy. Khi bạn ấy mở link ra sẽ tự động thấy Tấm Vé VIP mang tên mình kèm màu sắc giao diện tương ứng!
              </p>
            </div>

            <div>
              <label className="font-label-caps text-[10px] uppercase text-on-surface-variant block mb-1">
                Tên Bạn Bè Của Cậu
              </label>
              <input
                type="text"
                value={friendName}
                onChange={(e) => setFriendName(e.target.value)}
                placeholder="VD: Nguyễn Minh Anh"
                className="w-full px-space-md py-space-xs bg-surface-container-highest rounded-lg text-on-surface font-body-md"
              />
            </div>

            {/* Chọn màu sắc riêng cho người nhận link */}
            <div>
              <label className="font-label-caps text-[10px] uppercase text-on-surface-variant block mb-1.5">
                Tông Màu Dành Riêng Cho Bạn Ấy 🎨
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {THEMES.map(t => {
                  const isCur = (linkTheme || 'gold') === t.id
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setLinkTheme(t.id)}
                      className={`p-2 rounded-lg border text-left transition-all flex items-center gap-1.5 cursor-pointer ${
                        isCur ? 'bg-surface-container-high border-primary font-bold text-primary shadow-sm' : 'bg-surface-container border-outline-variant/30 text-on-surface-variant hover:border-primary/40'
                      }`}
                    >
                      <span className="w-3 h-3 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: t.primaryColor }}></span>
                      <span className="text-[10px] truncate">{t.name}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <button
              onClick={handleGenerateGuestLink}
              disabled={!friendName.trim()}
              className="w-full py-space-sm bg-primary text-on-primary font-button-text text-button-text rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.01] disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Copy className="w-4 h-4" />
              Tạo &amp; Sao Chép Link Gửi Zalo/Facebook
            </button>

            {copiedLink && (
              <div className="p-space-sm bg-surface-container-lowest rounded-xl border border-primary/40 break-all text-xs text-primary font-mono">
                <span className="font-label-caps text-[9px] uppercase text-outline block mb-1">Đã sao chép link:</span>
                {copiedLink}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Danh sách RSVP */}
        {activeTab === 'guests' && (
          <div className="py-space-md flex-1 flex flex-col justify-between space-y-space-md">
            <div>
              <div className="flex items-center justify-between mb-space-sm">
                <span className="font-label-caps text-[11px] uppercase text-primary tracking-wider font-bold">
                  Tổng số phản hồi: {safeRsvpList.length} người
                </span>
                <button
                  onClick={handleExportGuests}
                  className="px-2.5 py-1 bg-surface-container-high hover:bg-surface-bright text-primary rounded-lg font-button-text text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Tải JSON
                </button>
              </div>

              {safeRsvpList.length === 0 ? (
                <div className="text-center py-12 text-outline font-body-sm text-xs bg-surface-container/30 rounded-xl border border-outline-variant/20">
                  💌 Chưa có khách mời nào điền form RSVP.
                </div>
              ) : (
                <div className="space-y-space-xs max-h-[380px] overflow-y-auto pr-1">
                  {safeRsvpList.map((g, idx) => {
                    const guestThemeObj = THEMES.find(t => t.id === g.theme) || THEMES[0]
                    return (
                      <div key={g.id || idx} className="p-3 bg-surface-container rounded-xl flex flex-col gap-1.5 border border-outline-variant/30 group hover:border-primary/40 transition-colors shadow-sm">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <strong className="text-primary font-subheading-serif text-sm font-bold">{g.name}</strong>
                            <span className={`px-2 py-0.5 text-[9px] rounded-full uppercase font-bold tracking-wider flex items-center gap-1 ${
                              g.attendance === 'no' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-primary-container text-on-primary-container border border-primary/40'
                            }`}>
                              {g.attendance === 'no' ? 'Vắng mặt' : 'Tham gia'}
                            </span>
                          </div>
                          {onDeleteRsvp && (
                            <button
                              type="button"
                              onClick={() => onDeleteRsvp(g.id)}
                              className="text-outline hover:text-red-400 p-1.5 rounded-lg hover:bg-surface-container-high transition-colors cursor-pointer"
                              title="Xóa phản hồi này"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                        
                        {g.phone && (
                          <div className="text-[11px] text-outline flex items-center gap-1.5">
                            <Phone className="w-3 h-3 text-primary/70" />
                            <span>SĐT / Zalo: <strong className="text-on-surface">{g.phone}</strong></span>
                          </div>
                        )}

                        {g.plan && (
                          <div className="text-[11px] text-on-surface-variant flex items-baseline gap-1.5">
                            <span className="text-outline font-medium">Kế hoạch:</span>
                            <span className="text-on-surface font-medium">{g.plan}</span>
                          </div>
                        )}

                        {/* Theme màu sắc của khách */}
                        <div className="flex items-center gap-1.5 text-[11px] text-outline">
                          <span className="w-2.5 h-2.5 rounded-full inline-block shadow-sm" style={{ backgroundColor: guestThemeObj.primaryColor }}></span>
                          <span>Tông màu: <strong className="text-on-surface">{guestThemeObj.name}</strong></span>
                        </div>

                        {g.wish && (
                          <div className="text-[11px] text-tertiary italic bg-surface-container-lowest/60 p-2 rounded-lg border-l-2 border-primary mt-0.5">
                            <span className="text-outline text-[9px] uppercase tracking-wider block not-italic font-bold mb-0.5">
                              {g.attendance === 'no' ? 'Lý do & Lời nhắn:' : 'Lời chúc:'}
                            </span>
                            "{g.wish}"
                          </div>
                        )}

                        {g.timestamp && (
                          <div className="text-[10px] text-outline/70 flex items-center gap-1 mt-0.5 self-end">
                            <Clock className="w-2.5 h-2.5" />
                            <span>{g.timestamp}</span>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-space-sm border-t border-outline-variant/30 text-center">
          <button
            onClick={onClose}
            className="w-full py-2 bg-surface-container-high text-on-surface font-button-text text-xs rounded-xl"
          >
            Đóng Bảng Cài Đặt
          </button>
        </div>

      </div>
    </div>
  )
}
