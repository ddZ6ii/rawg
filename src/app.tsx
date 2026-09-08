export default function App() {
  return (
    <div className="relative container mx-auto grid min-h-dvh grid-rows-[auto_1fr] gap-3 bg-red-500 p-3 lg:grid-cols-2">
      <header className="bg-green-400 lg:col-span-2">Navbar</header>
      <aside className="hidden bg-amber-400 lg:block">Aside</aside>
      <main className="bg-blue-400">Main</main>
    </div>
  )
}
