import logo from '@/assets/logo.webp'

function Logo() {
  return <img src={logo} alt="" width={60} height={60} className="size-15" />
}

export function NavBar() {
  return (
    <nav className="bg-pink-400">
      <Logo />
    </nav>
  )
}
