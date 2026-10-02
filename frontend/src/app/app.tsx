import { useGameQuery } from '@/features/games'
import { ThemeToggle, useIsMobile, useScrollToTopOnChange } from '@/shared'

import {
  AppBody,
  AppHeader,
  AppLayout,
  AppMain,
  AppSidebar,
  AppToolbar,
} from './app-layout'
import {
  GamesFilters,
  GamesHeading,
  GamesResults,
  GenresPanel,
  NavBar,
} from './components'

export function App() {
  const isMobile = useIsMobile()

  const {
    gameQuery,
    deferredGameQuery,
    isPending,
    selectGenre,
    selectPlatform,
    selectSortOrder,
    setSearch,
  } = useGameQuery()

  // A new query shows a new list: start it from the top instead of keeping
  // the previous list's scroll position. Runs once the results have rendered.
  useScrollToTopOnChange(deferredGameQuery)

  return (
    <AppLayout>
      <AppHeader>
        <NavBar />
        <ThemeToggle />
      </AppHeader>

      <AppBody>
        {!isMobile && (
          <AppSidebar>
            <GenresPanel
              selectedGenre={gameQuery.genre}
              onSelectGenre={selectGenre}
            />
          </AppSidebar>
        )}

        <AppMain>
          <AppToolbar>
            {!isMobile && (
              <GamesFilters
                gameQuery={gameQuery}
                isPending={isPending}
                onSearch={setSearch}
                onSelectPlatform={selectPlatform}
                onSelectSortOrder={selectSortOrder}
              />
            )}

            <GamesHeading gameQuery={deferredGameQuery} />
          </AppToolbar>

          <GamesResults gameQuery={deferredGameQuery} isPending={isPending} />
        </AppMain>
      </AppBody>
    </AppLayout>
  )
}
