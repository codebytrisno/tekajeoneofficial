"use client"

import { useState } from "react"
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from "firebase/auth"
import { auth } from "@/lib/firebase"
import AdminLayout from "@/components/AdminLayout"
import { useAuth } from "@/lib/auth"

export default function PengaturanPage() {
  const { user } = useAuth()
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage("")
    setError("")

    if (newPassword !== confirmPassword) {
      setError("Password baru tidak cocok.")
      return
    }
    if (newPassword.length < 6) {
      setError("Password minimal 6 karakter.")
      return
    }

    setLoading(true)
    try {
      const credential = EmailAuthProvider.credential(user!.email!, currentPassword)
      await reauthenticateWithCredential(user!, credential)
      await updatePassword(user!, newPassword)
      setMessage("Password berhasil diubah.")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (err: any) {
      setError(err.message || "Gagal mengubah password.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminLayout>
      <div>
        <h2 className="font-headline text-[24px] leading-[1.4] font-semibold text-primary mb-2">Pengaturan</h2>
        <p className="font-body text-[16px] leading-[1.6] text-on-surface-variant mb-8">Kelola profil dan keamanan akun admin.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/20 p-6 space-y-6">
          <h3 className="font-headline text-[20px] leading-[1.4] font-semibold text-primary border-b border-outline-variant/20 pb-4">
            Profil Admin
          </h3>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
              {(user?.email?.[0] || "A").toUpperCase()}
            </div>
            <div>
              <p className="font-bold text-primary text-[16px] leading-[1.6]">{user?.email}</p>
              <p className="text-sm text-on-surface-variant">Administrator</p>
            </div>
          </div>
          <div className="space-y-3 text-sm text-on-surface-variant">
            <div className="flex justify-between py-2 border-b border-outline-variant/10">
              <span>Email</span>
              <span className="font-medium text-primary">{user?.email}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-outline-variant/10">
              <span>UID</span>
              <span className="font-mono text-xs">{user?.uid}</span>
            </div>
            <div className="flex justify-between py-2">
              <span>Terdaftar</span>
              <span>{user?.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString("id-ID") : "—"}</span>
            </div>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/20 p-6">
          <h3 className="font-headline text-[20px] leading-[1.4] font-semibold text-primary border-b border-outline-variant/20 pb-4 mb-6">
            Ubah Password
          </h3>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block font-[600] text-[13px] leading-[1.2] tracking-[0.05em] text-primary mb-1">Password Saat Ini</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-2 text-[16px] leading-[1.6] focus:ring-2 focus:ring-secondary/30 focus:border-secondary outline-none"
                required
              />
            </div>
            <div>
              <label className="block font-[600] text-[13px] leading-[1.2] tracking-[0.05em] text-primary mb-1">Password Baru</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-2 text-[16px] leading-[1.6] focus:ring-2 focus:ring-secondary/30 focus:border-secondary outline-none"
                required
              />
            </div>
            <div>
              <label className="block font-[600] text-[13px] leading-[1.2] tracking-[0.05em] text-primary mb-1">Konfirmasi Password Baru</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-2 text-[16px] leading-[1.6] focus:ring-2 focus:ring-secondary/30 focus:border-secondary outline-none"
                required
              />
            </div>

            {error && <div className="bg-error-container text-on-error-container px-4 py-3 rounded-lg text-sm">{error}</div>}
            {message && <div className="bg-green-100 text-green-800 px-4 py-3 rounded-lg text-sm font-bold">{message}</div>}

            <button
              type="submit"
              disabled={loading || !currentPassword || !newPassword || !confirmPassword}
              className="w-full bg-primary text-on-primary py-3 rounded-xl font-[600] text-[13px] leading-[1.2] tracking-[0.05em] hover:shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? "Menyimpan..." : "Simpan Password"}
            </button>
          </form>
        </div>
      </div>
    </AdminLayout>
  )
}
