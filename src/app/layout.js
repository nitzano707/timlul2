export const metadata = {
  title: 'תמלול אודיו',
  description: 'אפליקציית תמלול אודיו בעברית',
}

export default function RootLayout({ children }) {
  return (
    <html lang="he" dir="rtl">
      <body>{children}</body>
    </html>
  )
}
