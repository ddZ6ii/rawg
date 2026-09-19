import logo from '@/assets/logo.webp'

export function NavBar() {
  return (
    <nav>
      <div className="-mx-1 lg:-mx-3">
        <img src={logo} alt="" width={48} height={48} className="size-12" />
      </div>
    </nav>
  )
}
