import logo from '@/assets/logo.webp'

export function NavBar() {
  return (
    <nav>
      <div className="-mx-2 lg:-mx-4">
        <img src={logo} alt="" width={48} height={48} className="size-12" />
      </div>
    </nav>
  )
}
