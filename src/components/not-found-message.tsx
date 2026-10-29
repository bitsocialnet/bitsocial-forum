import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export default function NotFoundMessage({ title }: { title?: string }) {
  const { t } = useTranslation();

  return (
    <div className='py-10'>
      <h1 className='font-display text-3xl font-semibold text-muted-foreground'>{title ?? t('notFound.title')}</h1>
      <p className='mt-2 text-sm text-muted-foreground'>{t('notFound.description')}</p>
      <Link to='/' className='mt-4 inline-flex text-sm text-blue-glow hover:underline'>
        {t('notFound.backToCategories')}
      </Link>
    </div>
  );
}
