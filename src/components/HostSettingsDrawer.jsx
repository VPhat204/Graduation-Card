import { useState } from 'react'
import { Settings, X, Copy, Download, Trash2 } from 'lucide-react'

export default function HostSettingsDrawer({
  isOpen,
  onClose,
  hostData,
  onUpdateHostData,
  rsvpList,
  onDeleteRsvp,
  onTriggerConfetti
}) {
  const [activeTab, setActiveTab] = useState('settings') // 'settings' | 'guests' | 'link'
  const [friendName, setFriendName] = useState('')
  const [copiedLink, setCopiedLink] = useState('')
  const [formData, setFormData] = useState({ ...hostData })

  if (!isOpen) return null

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSaveSettings = (e) => {
    e.preventDefault()
    onUpdateHostData(formData)
    if (onTriggerConfetti) onTriggerConfetti()
    alert('Đã cập nhật thông tin Lễ Tốt Nghiệp thành công!')
  }

  const handleGenerateGuestLink = () => {
    if (!friendName.trim()) return
    const generatedUrl = `${window.location.origin}${window.location.pathname}?guest=${encodeURIComponent(friendName.trim())}`
    navigator.clipboard.writeText(generatedUrl)
    setCopiedLink(generatedUrl)
    if (onTriggerConfetti) onTriggerConfetti()
  }

  const handleExportGuests = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(rsvpList, null, 2))
    const downloadAnchor = document.createElement('a')
    downloadAnchor.setAttribute("href", dataStr)
    downloadAnchor.setAttribute("download", `Danh_Sach_RSVP_Tot_Nghiep_${hostData.graduateName}.json`)
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

          {/* Navigation Tabs */}
          <div className="grid grid-cols-3 gap-1 bg-surface-container-lowest p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('settings')}
              className={`py-1.5 font-button-text text-[11px] rounded-lg transition-all ${
                activeTab === 'settings'
                  ? 'bg-primary-container text-on-primary-container font-bold shadow'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Cài Đặt Thiệp
            </button>
            <button
              onClick={() => setActiveTab('link')}
              className={`py-1.5 font-button-text text-[11px] rounded-lg transition-all ${
                activeTab === 'link'
                  ? 'bg-primary-container text-on-primary-container font-bold shadow'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Tạo Link Tên Bạn
            </button>
            <button
              onClick={() => setActiveTab('guests')}
              className={`py-1.5 font-button-text text-[11px] rounded-lg transition-all ${
                activeTab === 'guests'
                  ? 'bg-primary-container text-on-primary-container font-bold shadow'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Danh Sách RSVP ({rsvpList.length})
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
                rows={3}
                value={formData.quote}
                onChange={handleChange}
                className="w-full px-space-md py-space-xs bg-surface-container-highest rounded-lg text-on-surface font-body-md"
              />
            </div>

            <button
              type="submit"
              className="w-full py-space-sm bg-primary text-on-primary font-button-text text-button-text rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.01] transition-transform"
            >
              Lưu Thay Đổi Thông Tin Thiệp 🎓
            </button>
          </form>
        )}

        {/* Tab 2: Tạo Link Cá Nhân Hóa */}
        {activeTab === 'link' && (
          <div className="py-space-md flex-1 space-y-space-md">
            <div className="bg-surface-container p-space-md rounded-xl border border-primary/30">
              <h4 className="font-subheading-serif text-on-surface font-bold mb-1">
                Tạo Đường Link Thiệp Riêng Cho Từng Bạn
              </h4>
              <p className="font-body-sm text-[12px] text-on-surface-variant leading-relaxed">
                Nhập tên bạn bè của bạn (VD: Minh Anh, Tuấn Anh, Linh Bùi...). Khi bạn ấy mở link ra sẽ tự động thấy Tấm Vé VIP mang chính tên bạn ấy!
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

            <button
              onClick={handleGenerateGuestLink}
              disabled={!friendName.trim()}
              className="w-full py-space-sm bg-primary text-on-primary font-button-text text-button-text rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.01] disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              <Copy className="w-4 h-4" />
              Tạo & Sao Chép Link Gửi Zalo/Facebook
            </button>

            {copiedLink && (
              <div className="p-space-sm bg-surface-container-lowest rounded-xl border border-primary/40 break-all text-xs text-primary font-mono">
                <span className="font-label-caps text-[9px] uppercase text-outline block mb-1">Đã sao chép link:</span>
                {copiedLink}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Danh sách RSVP */}
        {activeTab === 'guests' && (
          <div className="py-space-md flex-1 flex flex-col justify-between space-y-space-md">
            <div>
              <div className="flex items-center justify-between mb-space-sm">
                <span className="font-label-caps text-[10px] uppercase text-primary tracking-wider">
                  Tổng số phản hồi: {rsvpList.length} người
                </span>
                <button
                  onClick={handleExportGuests}
                  className="px-2 py-1 bg-surface-container-high text-primary rounded font-button-text text-[11px] flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  Tải JSON
                </button>
              </div>

              {rsvpList.length === 0 ? (
                <div className="text-center py-8 text-outline font-body-sm text-xs">
                  Chưa có khách mời nào điền form RSVP.
                </div>
              ) : (
                <div className="space-y-space-xs max-h-[360px] overflow-y-auto pr-1">
                  {rsvpList.map((g, idx) => (
                    <div key={g.id || idx} className="p-space-xs bg-surface-container rounded-lg flex flex-col gap-1 border border-outline-variant/30 group hover:border-primary/40 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <strong className="text-primary font-body-sm text-xs">{g.name}</strong>
                          <span className={`px-1.5 py-0.5 text-[9px] rounded uppercase font-bold ${
                            g.attendance === 'no' ? 'bg-error-container text-error' : 'bg-primary-container text-on-primary-container'
                          }`}>
                            {g.attendance === 'no' ? 'Vắng' : 'Tham gia'}
                          </span>
                        </div>
                        {onDeleteRsvp && (
                          <button
                            type="button"
                            onClick={() => onDeleteRsvp(g.id)}
                            className="text-outline hover:text-red-400 p-1 rounded transition-colors cursor-pointer"
                            title="Xóa phản hồi này"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      {g.phone && <div className="text-[11px] text-outline">SĐT/Zalo: {g.phone}</div>}
                      {g.plan && <div className="text-[11px] text-on-surface-variant">Kế hoạch: {g.plan}</div>}
                      {g.wish && <div className="text-[11px] text-tertiary italic">"{g.wish}"</div>}
                    </div>
                  ))}
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
