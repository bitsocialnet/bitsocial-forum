import { Search } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { getSearchPath } from '../lib/search';

function SearchForm({ initialQuery }: { initialQuery: string }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [query, setQuery] = useState(initialQuery);

  return (
    <form
      role='search'
      className='relative w-full'
      onSubmit={(event) => {
        event.preventDefault();
        navigate(getSearchPath(query));
      }}
    >
      <Search aria-hidden className='pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
      <input
        type='search'
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={t('search.placeholder')}
        aria-label={t('search.label')}
        className='h-10 w-full rounded-full border border-border bg-background/40 pe-4 ps-10 text-sm text-foreground transition-colors duration-200 placeholder:text-muted-foreground hover:border-blue-glow/40 focus:border-blue-glow focus:shadow-[var(--focus-app-glow)] focus:outline-none'
      />
    </form>
  );
}

// The header search bar. On the search page it shows the current query, so clicking a tag fills it;
// keying the form by that query resets the draft whenever the URL's query changes.
export default function SearchBar() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const currentQuery = location.pathname === '/search' ? (searchParams.get('q') ?? '') : '';

  return <SearchForm key={currentQuery} initialQuery={currentQuery} />;
}
