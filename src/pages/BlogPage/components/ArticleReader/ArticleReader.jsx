import { useNewsResource } from '../../../../hooks/useNewsResource.js';
import ArticleDialog from '../ArticleDialog/ArticleDialog.jsx';

export default function ArticleReader({ articleId, id, onClose }) {
  const { data, loading, error, reload } = useNewsResource(`/api/news/${encodeURIComponent(articleId)}`, true);
  return <ArticleDialog id={id} article={data?.article} loading={loading} error={error} onRetry={reload} onClose={onClose} />;
}
