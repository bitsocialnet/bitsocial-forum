import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Route, Routes } from 'react-router-dom';
import Sidebar from './components/sidebar';
import SiteFooter from './components/site-footer';
import SiteHeader from './components/site-header';
import { cn } from './lib/utils';
import AboutSections from './views/about-sections';
import Categories from './views/categories';
import Community from './views/community';
import NotFound from './views/not-found';
import Profile from './views/profile';
import Search from './views/search';
import Section from './views/section';
import Topic from './views/topic';

// Discourse layout: a full-width header, a sections sidebar (a drawer below lg), and the page.
export default function App() {
  const { t } = useTranslation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className='flex min-h-screen flex-col'>
      <SiteHeader isSidebarOpen={isSidebarOpen} onToggleSidebar={() => setIsSidebarOpen((isOpen) => !isOpen)} />
      <div className='mx-auto flex w-full max-w-screen-xl flex-1'>
        {isSidebarOpen ? (
          <button type='button' aria-label={t('header.closeSidebar')} onClick={closeSidebar} className='fixed inset-0 top-16 z-20 bg-black/40 lg:hidden' />
        ) : null}
        <aside
          id='forum-sidebar'
          className={cn(
            'w-64 shrink-0 px-3',
            'max-lg:sheet-glass max-lg:fixed max-lg:bottom-0 max-lg:start-0 max-lg:top-16 max-lg:z-30 max-lg:overflow-y-auto',
            !isSidebarOpen && 'max-lg:hidden',
          )}
        >
          <div className='[scrollbar-color:hsl(var(--border))_transparent] [scrollbar-width:thin] lg:sticky lg:top-16 lg:max-h-[calc(100vh-4rem)] lg:overflow-y-auto'>
            <Sidebar onNavigate={closeSidebar} />
          </div>
        </aside>
        <div className='flex min-w-0 flex-1 flex-col'>
          <main className='flex-1 px-4 py-8 lg:px-8'>
            <Routes>
              <Route path='/' element={<Categories />} />
              <Route path='/about/sections' element={<AboutSections />} />
              <Route path='/profile' element={<Profile />} />
              <Route path='/search' element={<Search />} />
              <Route path='/s/:sectionCode/:sort?' element={<Section />} />
              <Route path='/c/:communityAddress/t/:commentCid' element={<Topic />} />
              <Route path='/c/:communityAddress/:sort?' element={<Community />} />
              <Route path='*' element={<NotFound />} />
            </Routes>
          </main>
          <SiteFooter />
        </div>
      </div>
    </div>
  );
}
